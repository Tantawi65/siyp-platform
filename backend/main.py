from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base
from models import user

from api.routes import api_router
from fastapi.staticfiles import StaticFiles
import os

# Alembic is used for migrations instead of create_all
app = FastAPI(title="SIYP Team API")

origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# If using wildcard, credentials must be disabled (browser security requirement)
if origins == ["*"]:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix="/api")

# Uploads are now handled via Cloudinary, so local static file mounting is removed.


@app.get("/")
def read_root():
    return {"message": "Welcome to the SIYP Team API"}
