from pydantic import BaseModel, Field
from typing import Optional, List


class SiteCreate(BaseModel):
    name: str
    description: Optional[str] = None
    coordinates: List[List[float]] = Field(
        ...,
        min_length=4,
        description="Polygon coordinates as [longitude, latitude]",
    )


class SiteResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    area_hectares: Optional[float]
    project_id: int
    geometry: dict