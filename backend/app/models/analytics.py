from sqlalchemy import (
    Column,
    Integer,
    Float,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database import Base


class SiteAnalytics(Base):
    __tablename__ = "site_analytics"

    id = Column(Integer, primary_key=True, index=True)

    site_id = Column(
        Integer,
        ForeignKey("sites.id", ondelete="CASCADE"),
        nullable=False,
    )

    recorded_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    carbon_stock = Column(Float, nullable=True)

    biodiversity_score = Column(Float, nullable=True)

    species_richness = Column(Float, nullable=True)

    soil_organic_carbon = Column(Float, nullable=True)

    soil_ph = Column(Float, nullable=True)

    soil_moisture = Column(Float, nullable=True)

    rainfall = Column(Float, nullable=True)

    temperature = Column(Float, nullable=True)

    site = relationship(
        "Site",
        back_populates="analytics",
    )