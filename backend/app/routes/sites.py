from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from geoalchemy2.shape import from_shape
from shapely.geometry import Polygon

from app.database import get_db
from app.models.site import Site
from app.models.project import Project
from app.models.user import User
from app.schemas.site import SiteCreate, SiteResponse
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/api/projects/{project_id}/sites",
    tags=["Sites"],
)


@router.post(
    "",
    response_model=SiteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_site(
    project_id: int,
    site_data: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check project ownership
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

    # Validate polygon coordinates
    if site_data.coordinates[0] != site_data.coordinates[-1]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Polygon must be closed: first and last coordinates must match",
        )

    try:
        polygon = Polygon(site_data.coordinates)

        if not polygon.is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid polygon geometry",
            )

        if polygon.is_empty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Polygon cannot be empty",
            )

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid polygon coordinates: {str(e)}",
        )

    # Convert Shapely polygon to PostGIS geometry
    geometry = from_shape(
        polygon,
        srid=4326,
    )

    # Create site
    new_site = Site(
        name=site_data.name,
        description=site_data.description,
        geometry=geometry,
        project_id=project_id,
    )

    db.add(new_site)
    db.commit()
    db.refresh(new_site)

    # Calculate area in hectares
    area = (
        db.query(
            func.ST_Area(
                func.ST_Transform(
                    Site.geometry,
                    6933,
                )
            )
        )
        .filter(Site.id == new_site.id)
        .scalar()
    )

    area_hectares = float(area) / 10000

    new_site.area_hectares = area_hectares

    db.commit()
    db.refresh(new_site)

    # Convert geometry to GeoJSON
    geojson = (
        db.query(
            func.ST_AsGeoJSON(Site.geometry)
        )
        .filter(Site.id == new_site.id)
        .scalar()
    )

    import json

    return {
        "id": new_site.id,
        "name": new_site.name,
        "description": new_site.description,
        "area_hectares": new_site.area_hectares,
        "project_id": new_site.project_id,
        "geometry": json.loads(geojson),
    }


@router.get(
    "",
    response_model=list[SiteResponse],
)
def get_sites(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check project ownership
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

    sites = (
        db.query(Site)
        .filter(Site.project_id == project_id)
        .order_by(Site.created_at.desc())
        .all()
    )

    result = []

    import json

    for site in sites:
        geojson = (
            db.query(
                func.ST_AsGeoJSON(Site.geometry)
            )
            .filter(Site.id == site.id)
            .scalar()
        )

        result.append(
            {
                "id": site.id,
                "name": site.name,
                "description": site.description,
                "area_hectares": site.area_hectares,
                "project_id": site.project_id,
                "geometry": json.loads(geojson),
            }
        )

    return result