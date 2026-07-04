from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from core.database import get_db, engine, Base
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

@app.get("/api/fix-sequences")
def fix_sequences(db: Session = Depends(get_db)):
    try:
        tables = ['users', 'profiles', 'opportunities', 'saved_opportunities', 'tags', 'categories', 'programs']
        for table in tables:
            db.execute(text(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE(MAX(id), 1) ) FROM {table};"))
        
        db.commit()
        return {"status": "success"}
    except Exception as e:
        import traceback
        error_msg = f"{str(e)}\n{traceback.format_exc()}"
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=error_msg)

# Uploads are now handled via Cloudinary, so local static file mounting is removed.


@app.get("/")
def read_root():
    return {"message": "Welcome to the SIYP Team API"}
