# Darukaa.Earth

Full-stack geospatial data analytics platform for carbon and biodiversity projects.

## Live Demo

https://darukaa-earth-frontend-difz.onrender.com

## Repository

https://github.com/0xAdarsh404/darukaa-earth

## Overview

Darukaa.Earth provides a dashboard for managing carbon and biodiversity projects, creating geographical sites, visualizing sites on an interactive map, and recording and analyzing environmental performance over time.

## Key Features

- JWT-based user registration and login
- Protected dashboard routes
- Project and site management
- Interactive Mapbox GL JS map
- Draw polygon boundaries for geographical sites using Mapbox Draw
- PostGIS polygon storage and geospatial area calculation
- Site area displayed in hectares
- Carbon and biodiversity analytics
- Historical analytics records
- Interactive Chart.js visualizations
- REST API using FastAPI
- PostgreSQL + PostGIS database
- GitHub Actions CI for frontend linting and production builds
- Production deployment using Render

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Mapbox GL JS
- Mapbox GL Draw
- Chart.js / react-chartjs-2

### Backend
- Python
- FastAPI
- SQLAlchemy
- GeoAlchemy2
- Shapely
- JWT authentication
- PostgreSQL
- PostGIS

### DevOps
- Git / GitHub
- GitHub Actions
- Render

## Architecture

```text
React + Vite
     |
     | REST API / JWT
     v
FastAPI
     |
     | SQLAlchemy / GeoAlchemy2
     v
PostgreSQL + PostGIS
```

The frontend handles authentication, dashboard views, maps, site creation, and analytics visualization. The FastAPI backend provides authenticated REST endpoints and performs project/site ownership checks and geospatial operations. PostgreSQL stores application data and PostGIS stores site polygon geometry.

## Database Schema

### User
Stores registered users and authentication information.

Key fields:
- `id`
- `name`
- `email`
- password hash

### Project
Stores project information and ownership.

Key fields:
- `id`
- `name`
- `description`
- `project_type`
- `owner_id`
- `created_at`

Relationship:
- One user can own multiple projects.
- One project can contain multiple sites.

### Site
Stores geographical project sites.

Key fields:
- `id`
- `name`
- `description`
- `area_hectares`
- `geometry`
- `project_id`
- `created_at`

`geometry` is stored as a PostGIS `POLYGON` with SRID 4326.

### SiteAnalytics
Stores environmental measurements over time.

Key fields:
- `id`
- `site_id`
- `recorded_at`
- `carbon_stock`
- `biodiversity_score`
- `species_richness`
- `soil_organic_carbon`
- `soil_ph`
- `soil_moisture`
- `rainfall`
- `temperature`

## API Overview

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

### Projects
- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/{project_id}`

### Sites
- `POST /api/projects/{project_id}/sites`
- `GET /api/projects/{project_id}/sites`

### Analytics
- `POST /api/sites/{site_id}/analytics`
- `GET /api/sites/{site_id}/analytics`

### Health
- `GET /api/health`

## Local Setup

### Prerequisites

- Node.js 20+
- Python 3.x
- PostgreSQL with PostGIS
- Mapbox access token

### Backend

```bash
cd backend

python -m venv venv
```

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=your_postgresql_database_url
FRONTEND_URL=http://localhost:5173
```

Run the API:

```bash
uvicorn app.main:app --reload
```

Backend runs locally at:

```text
http://127.0.0.1:8000
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_MAPBOX_TOKEN=your_mapbox_token
```

Start the frontend:

```bash
npm run dev
```

Frontend runs locally at:

```text
http://localhost:5173
```

## CI/CD

GitHub Actions workflow:

```text
.github/workflows/ci.yml
```

The workflow runs on pushes and pull requests targeting `main` or `master`.

Current checks include:

1. Checkout repository
2. Set up Node.js 20
3. Install dependencies with `npm ci`
4. Run ESLint
5. Build the production frontend with `npm run build`

The application is deployed publicly through Render.

## Environment Variables

### Frontend

```env
VITE_API_URL=
VITE_MAPBOX_TOKEN=
```

### Backend

```env
DATABASE_URL=
FRONTEND_URL=
```

Secrets and environment files should not be committed to Git.

## Project Structure

```text
Darukaa-Earth/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── services/
│   └── ...
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routes/
│   │   └── ...
│   └── requirements.txt
├── .github/
│   └── workflows/
│       └── ci.yml
├── README.md
└── .gitignore
```

## Deployment

The production frontend is deployed on Render as a static site.

Live frontend:

https://darukaa-earth-frontend-difz.onrender.com

The FastAPI backend is deployed as a Render web service and uses the Render PostgreSQL database with PostGIS enabled.

## Security Notes

- JWT is used for authenticated API requests.
- Database credentials and API tokens are supplied through environment variables.
- Do not commit `.env` files or secrets to GitHub.

## Assessment Notes

This project was built for the Darukaa.Earth Full-Stack Developer assessment and follows the requested React, Mapbox, Chart.js, FastAPI, PostgreSQL/PostGIS, JWT, GitHub Actions, and public deployment stack.
