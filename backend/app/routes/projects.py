from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"],
)


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_project = Project(
        name=project_data.name,
        description=project_data.description,
        project_type=project_data.project_type,
        owner_id=current_user.id,
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


@router.get(
    "",
    response_model=list[ProjectResponse],
)
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    projects = (
        db.query(Project)
        .filter(Project.owner_id == current_user.id)
        .order_by(Project.created_at.desc())
        .all()
    )

    return projects


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
        )
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return project