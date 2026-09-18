from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.analytics import SiteAnalytics
from app.models.site import Site
from app.models.project import Project
from app.models.user import User
from app.schemas.analytics import AnalyticsCreate, AnalyticsResponse
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/api/sites/{site_id}/analytics",
    tags=["Site Analytics"],
)


def get_user_site(
    site_id: int,
    db: Session,
    current_user: User,
):
    site = (
        db.query(Site)
        .join(Project, Site.project_id == Project.id)
        .filter(
            Site.id == site_id,
            Project.owner_id == current_user.id,
        )
        .first()
    )

    if site is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found",
        )

    return site


@router.post(
    "",
    response_model=AnalyticsResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_analytics(
    site_id: int,
    analytics_data: AnalyticsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify that the site belongs to the logged-in user
    get_user_site(site_id, db, current_user)

    analytics = SiteAnalytics(
        site_id=site_id,
        recorded_at=analytics_data.recorded_at,
        carbon_stock=analytics_data.carbon_stock,
        biodiversity_score=analytics_data.biodiversity_score,
        species_richness=analytics_data.species_richness,
        soil_organic_carbon=analytics_data.soil_organic_carbon,
        soil_ph=analytics_data.soil_ph,
        soil_moisture=analytics_data.soil_moisture,
        rainfall=analytics_data.rainfall,
        temperature=analytics_data.temperature,
    )

    db.add(analytics)
    db.commit()
    db.refresh(analytics)

    return analytics


@router.get(
    "",
    response_model=list[AnalyticsResponse],
)
def get_analytics(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify that the site belongs to the logged-in user
    get_user_site(site_id, db, current_user)

    analytics = (
        db.query(SiteAnalytics)
        .filter(SiteAnalytics.site_id == site_id)
        .order_by(SiteAnalytics.recorded_at.asc())
        .all()
    )

    return analytics