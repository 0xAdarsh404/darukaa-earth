from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime, timezone

from app.database import Base


class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)

    description = Column(Text, nullable=True)

    area_hectares = Column(Float, nullable=True)

    geometry = Column(
        Geometry(
            geometry_type="POLYGON",
            srid=4326,
        ),
        nullable=False,
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    project = relationship(
        "Project",
        back_populates="sites",
    )

    analytics = relationship(
        "SiteAnalytics",
        back_populates="site",
        cascade="all, delete-orphan",
    )