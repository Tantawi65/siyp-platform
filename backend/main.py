from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.database import engine, Base
from backend.models import user

from backend.api.routes import api_router
from fastapi.staticfiles import StaticFiles
import os

# Alembic is used for migrations instead of create_all
app = FastAPI(title="SIYP Team API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

# Uploads are now handled via Cloudinary, so local static file mounting is removed.


@app.get("/")
def read_root():
    return {"message": "Welcome to the SIYP Team API"}
