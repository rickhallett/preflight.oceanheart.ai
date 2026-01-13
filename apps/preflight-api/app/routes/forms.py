"""Form definition API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..dependencies import get_db
from ..models.forms import FormDefinition
from ..schemas.forms import FormDefinitionResponse, RFC7807Error

router = APIRouter(prefix="/forms", tags=["forms"])


@router.get(
    "/{form_name}",
    response_model=FormDefinitionResponse,
    responses={
        404: {"model": RFC7807Error, "description": "Form not found"},
    },
)
async def get_form_definition(
    form_name: str,
    version: str | None = Query(default=None, description="Specific version to retrieve"),
    db: Session = Depends(get_db),
) -> FormDefinitionResponse:
    """
    Get a form definition by name.

    Returns the form definition JSON including pages, navigation settings, and metadata.
    If version is not specified, returns the latest active version.
    """
    query = select(FormDefinition).where(
        FormDefinition.name == form_name,
        FormDefinition.is_active.is_(True),
    )

    if version:
        query = query.where(FormDefinition.version == version)
    else:
        query = query.order_by(FormDefinition.created_at.desc())

    result = db.execute(query).scalar_one_or_none()

    if not result:
        raise HTTPException(
            status_code=404,
            detail={
                "type": "https://preflight.oceanheart.ai/errors/form-not-found",
                "title": "Form Not Found",
                "status": 404,
                "detail": f"Form '{form_name}' with version '{version or 'latest'}' not found",
                "instance": f"/forms/{form_name}",
            },
        )

    definition = result.definition
    return FormDefinitionResponse(
        id=definition.get("id", result.name),
        title=definition.get("title", result.name),
        pages=definition.get("pages", []),
        navigation=definition.get("navigation", {"style": "pager", "autosave": True}),
        meta=definition.get("meta", {"version": result.version}),
    )
