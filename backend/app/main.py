from fastapi import FastAPI
from sqlalchemy import text
from app.routes.auth import router as auth_router
from fastapi import Depends
from app.core.dependencies import get_current_user
from app.models.user import User
from app.database import engine, Base
from app.routes.projects import router as projects_router
from app.routes.sites import router as sites_router
# Import models so SQLAlchemy knows about all tables
from app.models import User, Project, Site, SiteAnalytics
from app.routes.analytics import router as analytics_router
from fastapi.middleware.cors import CORSMiddleware
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Darukaa.Earth API",
    description="Geospatial Carbon & Biodiversity Analytics Platform",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(sites_router)
app.include_router(analytics_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to Darukaa.Earth API"
    }


@app.get("/api/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
        }
@app.get("/api/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
    }        