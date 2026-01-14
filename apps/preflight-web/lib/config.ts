/**
 * Frontend configuration and validation
 *
 * Validates required environment variables on startup
 */

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Get the API URL from environment
 */
export function getApiUrl(): string {
  // Check environment variable first
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // Default based on environment
  if (typeof window !== "undefined") {
    const isDev =
      window.location.hostname === "localhost" ||
      window.location.hostname.includes("lvh.me");
    return isDev ? "http://localhost:8000" : "https://api.preflight.oceanheart.ai";
  }

  return process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://api.preflight.oceanheart.ai";
}

/**
 * Get the Passport URL from environment
 */
export function getPassportUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_PASSPORT_URL;
  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== "undefined") {
    const isDev =
      window.location.hostname === "localhost" ||
      window.location.hostname.includes("lvh.me");
    return isDev ? "http://passport.lvh.me:8004" : "https://passport.oceanheart.ai";
  }

  return process.env.NODE_ENV === "development"
    ? "http://passport.lvh.me:8004"
    : "https://passport.oceanheart.ai";
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Validate frontend configuration
 * Call this on app startup to catch issues early
 */
export function validateConfig(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for required environment variables in production
  if (isProduction()) {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      warnings.push("NEXT_PUBLIC_API_URL not set, using default");
    }
  }

  // Check for development mode indicators
  if (!isProduction()) {
    warnings.push("Running in development mode");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Log configuration validation results
 */
export function logConfigValidation(result: ConfigValidationResult): void {
  if (typeof window === "undefined") return;

  result.errors.forEach((error) => {
    console.error(`[Config Error] ${error}`);
  });

  result.warnings.forEach((warning) => {
    console.warn(`[Config Warning] ${warning}`);
  });

  if (result.valid) {
    console.info("[Config] Configuration validated successfully");
  }
}
