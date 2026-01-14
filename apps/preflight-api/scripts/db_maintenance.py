#!/usr/bin/env python
"""Database maintenance utilities.

Usage:
    python scripts/db_maintenance.py stats     # Show database statistics
    python scripts/db_maintenance.py vacuum    # Run VACUUM ANALYZE
    python scripts/db_maintenance.py cleanup   # Clean old data
    python scripts/db_maintenance.py backup    # Backup database (pg_dump)
"""

import argparse
import os
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.database import get_engine, get_pool_status


def get_table_stats(engine) -> list[dict]:
    """Get statistics for all tables."""
    query = text("""
        SELECT
            schemaname,
            relname as table_name,
            n_live_tup as row_count,
            n_dead_tup as dead_rows,
            last_vacuum,
            last_autovacuum,
            last_analyze,
            pg_size_pretty(pg_total_relation_size(relid)) as total_size
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC
    """)

    with engine.connect() as conn:
        result = conn.execute(query)
        return [dict(row._mapping) for row in result]


def get_index_stats(engine) -> list[dict]:
    """Get statistics for all indexes."""
    query = text("""
        SELECT
            schemaname,
            relname as table_name,
            indexrelname as index_name,
            idx_scan as scans,
            idx_tup_read as tuples_read,
            idx_tup_fetch as tuples_fetched,
            pg_size_pretty(pg_relation_size(indexrelid)) as size
        FROM pg_stat_user_indexes
        ORDER BY idx_scan DESC
    """)

    with engine.connect() as conn:
        result = conn.execute(query)
        return [dict(row._mapping) for row in result]


def get_database_size(engine) -> str:
    """Get total database size."""
    query = text("""
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
    """)

    with engine.connect() as conn:
        result = conn.execute(query)
        return result.scalar()


def run_vacuum_analyze(engine) -> None:
    """Run VACUUM ANALYZE on all tables."""
    tables = ["form_definitions", "runs", "answers", "prompt_pipelines",
              "coaching_sessions", "coach_turns"]

    with engine.connect() as conn:
        # Can't run VACUUM in transaction, use raw connection
        conn = conn.execution_options(isolation_level="AUTOCOMMIT")
        for table in tables:
            print(f"  VACUUM ANALYZE {table}...")
            conn.execute(text(f"VACUUM ANALYZE {table}"))


def cleanup_old_data(engine, days: int = 90) -> dict:
    """Clean up old abandoned runs and sessions."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    stats = {"deleted_runs": 0, "deleted_sessions": 0}

    with engine.connect() as conn:
        # Delete old abandoned coaching sessions
        result = conn.execute(
            text("""
                DELETE FROM coaching_sessions
                WHERE status = 'abandoned'
                AND last_activity_at < :cutoff
                RETURNING id
            """),
            {"cutoff": cutoff}
        )
        stats["deleted_sessions"] = result.rowcount

        # Delete old abandoned runs (cascade will delete answers)
        result = conn.execute(
            text("""
                DELETE FROM runs
                WHERE status = 'abandoned'
                AND started_at < :cutoff
                AND id NOT IN (SELECT run_id FROM coaching_sessions)
                RETURNING id
            """),
            {"cutoff": cutoff}
        )
        stats["deleted_runs"] = result.rowcount

        conn.commit()

    return stats


def backup_database(output_dir: str = "./backups") -> str:
    """Create a database backup using pg_dump."""
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        raise ValueError("DATABASE_URL not set")

    # Parse connection details
    # Format: postgresql://user:pass@host:port/dbname
    from urllib.parse import urlparse
    parsed = urlparse(db_url)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = Path(output_dir) / f"preflight_backup_{timestamp}.sql.gz"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    env = os.environ.copy()
    if parsed.password:
        env["PGPASSWORD"] = parsed.password

    cmd = [
        "pg_dump",
        "-h", parsed.hostname or "localhost",
        "-p", str(parsed.port or 5432),
        "-U", parsed.username or "preflight",
        "-d", parsed.path.lstrip("/"),
        "--format=plain",
        "--no-owner",
        "--no-privileges",
    ]

    # Pipe through gzip
    with open(output_path, "wb") as f:
        pg_dump = subprocess.Popen(cmd, stdout=subprocess.PIPE, env=env)
        gzip_proc = subprocess.Popen(["gzip"], stdin=pg_dump.stdout, stdout=f)
        pg_dump.stdout.close()
        gzip_proc.communicate()

    return str(output_path)


def cmd_stats(args):
    """Show database statistics."""
    engine = get_engine()

    print("\n=== Database Statistics ===\n")
    print(f"Total Size: {get_database_size(engine)}")

    print("\n--- Connection Pool ---")
    pool = get_pool_status()
    for key, value in pool.items():
        print(f"  {key}: {value}")

    print("\n--- Table Statistics ---")
    for table in get_table_stats(engine):
        print(f"\n  {table['table_name']}:")
        print(f"    Rows: {table['row_count']:,}")
        print(f"    Dead rows: {table['dead_rows']:,}")
        print(f"    Size: {table['total_size']}")
        if table['last_vacuum']:
            print(f"    Last vacuum: {table['last_vacuum']}")

    print("\n--- Index Usage ---")
    for idx in get_index_stats(engine)[:10]:  # Top 10 by scans
        print(f"  {idx['index_name']}: {idx['scans']:,} scans, {idx['size']}")


def cmd_vacuum(args):
    """Run VACUUM ANALYZE."""
    print("\n=== Running VACUUM ANALYZE ===\n")
    engine = get_engine()
    run_vacuum_analyze(engine)
    print("\nDone!")


def cmd_cleanup(args):
    """Clean up old data."""
    print(f"\n=== Cleaning up data older than {args.days} days ===\n")
    engine = get_engine()
    stats = cleanup_old_data(engine, args.days)
    print(f"  Deleted {stats['deleted_runs']} abandoned runs")
    print(f"  Deleted {stats['deleted_sessions']} abandoned sessions")
    print("\nDone!")


def cmd_backup(args):
    """Create database backup."""
    print("\n=== Creating Database Backup ===\n")
    try:
        path = backup_database(args.output)
        print(f"  Backup created: {path}")
    except Exception as e:
        print(f"  Error: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Database maintenance utilities")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Stats command
    subparsers.add_parser("stats", help="Show database statistics")

    # Vacuum command
    subparsers.add_parser("vacuum", help="Run VACUUM ANALYZE")

    # Cleanup command
    cleanup_parser = subparsers.add_parser("cleanup", help="Clean up old data")
    cleanup_parser.add_argument(
        "--days", type=int, default=90,
        help="Delete abandoned data older than N days (default: 90)"
    )

    # Backup command
    backup_parser = subparsers.add_parser("backup", help="Backup database")
    backup_parser.add_argument(
        "--output", default="./backups",
        help="Output directory for backups"
    )

    args = parser.parse_args()

    commands = {
        "stats": cmd_stats,
        "vacuum": cmd_vacuum,
        "cleanup": cmd_cleanup,
        "backup": cmd_backup,
    }

    commands[args.command](args)


if __name__ == "__main__":
    main()
