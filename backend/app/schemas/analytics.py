from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AnalyticsCreate(BaseModel):
    recorded_at: Optional[datetime] = None

    carbon_stock: Optional[float] = None
    biodiversity_score: Optional[float] = None
    species_richness: Optional[float] = None

    soil_organic_carbon: Optional[float] = None
    soil_ph: Optional[float] = None
    soil_moisture: Optional[float] = None

    rainfall: Optional[float] = None
    temperature: Optional[float] = None


class AnalyticsResponse(BaseModel):
    id: int
    site_id: int
    recorded_at: datetime

    carbon_stock: Optional[float]
    biodiversity_score: Optional[float]
    species_richness: Optional[float]

    soil_organic_carbon: Optional[float]
    soil_ph: Optional[float]
    soil_moisture: Optional[float]

    rainfall: Optional[float]
    temperature: Optional[float]

    class Config:
        from_attributes = True