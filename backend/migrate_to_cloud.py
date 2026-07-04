import os
import sys
from dotenv import load_dotenv

# Add parent dir to path so we can import backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

import cloudinary
import cloudinary.uploader
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import all models to populate Base.metadata
from core.database import Base
from models.user import User, Profile
from models.program import ProgramCatalog, user_accepted_programs
from models.opportunity import Opportunity, Category, Tag, opportunity_tags
from models.tracker import SavedOpportunity

# Setup Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")

def main():
    print("Starting migration...")
    
    # 1. Setup Engines
    sqlite_url = f"sqlite:///{os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sql_app.db')}"
    neon_url = os.getenv("DATABASE_URL")
    
    print(f"Source: {sqlite_url}")
    print(f"Target: {neon_url}")
    
    sqlite_engine = create_engine(sqlite_url)
    neon_engine = create_engine(neon_url)
    
    # 2. Create tables in Neon
    print("Creating tables in Neon...")
    Base.metadata.create_all(neon_engine)
    
    # 3. Copy data
    for table in Base.metadata.sorted_tables:
        print(f"Migrating table: {table.name}...")
        with sqlite_engine.connect() as sqlite_conn:
            rows = sqlite_conn.execute(table.select()).fetchall()
            
        if not rows:
            print(f"  No rows in {table.name}, skipping.")
            continue
            
        # Convert rows to dicts for manipulation/insertion
        insert_data = []
        for row in rows:
            row_dict = dict(row._mapping)
            
            # Special handling for local avatars
            if table.name == "profiles":
                avatar_url = row_dict.get("avatar_url")
                if avatar_url and avatar_url.startswith("http://localhost:8000/uploads/"):
                    filename = avatar_url.split("/")[-1]
                    filepath = os.path.join(UPLOADS_DIR, filename)
                    if os.path.exists(filepath):
                        print(f"  Uploading avatar {filename} to Cloudinary...")
                        try:
                            res = cloudinary.uploader.upload(filepath, folder="siyp_avatars")
                            row_dict["avatar_url"] = res.get("secure_url")
                            print(f"  New URL: {row_dict['avatar_url']}")
                        except Exception as e:
                            print(f"  Failed to upload {filename}: {e}")
                    else:
                        print(f"  Local file not found for avatar: {filepath}")
            
            insert_data.append(row_dict)
            
        with neon_engine.connect() as neon_conn:
            # Need to clear existing data if rerunning
            neon_conn.execute(table.delete())
            neon_conn.execute(table.insert(), insert_data)
            neon_conn.commit()
            print(f"  Inserted {len(insert_data)} rows into {table.name}.")
            
    print("Migration complete!")

if __name__ == "__main__":
    main()
