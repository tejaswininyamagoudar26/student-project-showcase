import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import create_tables, test_connection
from .routes import auth, projects, students, comments, admin, upload

app = FastAPI(
    title="ProjectHub API",
    description="Backend API for Student Project Showcase platform",
    version="1.0.0",
)

# CORS setup
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
origins = [
    frontend_url,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads directory setup and static file mounting
uploads_dir = Path(__file__).resolve().parents[2] / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Include Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(projects.router, tags=["Projects"])
app.include_router(students.router, tags=["Students & Dashboard"])
app.include_router(comments.router, tags=["Comments"])
app.include_router(admin.router, tags=["Administration"])
app.include_router(upload.router, tags=["Uploads"])


@app.on_event("startup")
async def startup_event():
    if not test_connection():
        raise RuntimeError("Failed to connect to the MySQL database.")
    create_tables()


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": "ProjectHub API"}
