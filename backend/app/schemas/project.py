from pydantic import BaseModel
from typing import Optional


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    project_type: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    project_type: Optional[str]
    owner_id: int

    class Config:
        from_attributes = True