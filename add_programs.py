import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.core.database import SessionLocal
from backend.models.user import User
from backend.models.program import ProgramCatalog

def add_programs():
    db = SessionLocal()
    
    programs = [
        {"name": "African Leadership Academy", "organization": "ALA", "country": "South Africa", "description": "A two-year pre-university diploma program in entrepreneurial leadership and African studies.", "verified": True},
        {"name": "Yale Young African Scholars", "organization": "Yale University", "country": "Africa / Online", "description": "YYAS is an intensive academic and enrichment program designed for African secondary school students.", "verified": True},
        {"name": "Yale Young Global Scholars", "organization": "Yale University", "country": "USA", "description": "YYGS is a summer academic enrichment and leadership program for high school students.", "verified": True},
        {"name": "Take Action Lab", "organization": "Global Citizen Year", "country": "Global", "description": "An immersive semester program for young leaders to accelerate their impact.", "verified": True},
        {"name": "Kennedy-Lugar Youth Exchange and Study (YES)", "organization": "U.S. Department of State", "country": "USA", "description": "Provides scholarships for high school students to study for one academic year in the U.S.", "verified": True},
        {"name": "TechGirls", "organization": "U.S. Department of State", "country": "USA", "description": "A summer exchange program designed to empower and inspire young women from around the world to pursue careers in STEM.", "verified": True},
        {"name": "Rise (Schmidt Futures & Rhodes Trust)", "organization": "Rise", "country": "Global", "description": "A program that finds brilliant people who need opportunity and supports them for life.", "verified": True},
        {"name": "UWC (United World Colleges)", "organization": "UWC", "country": "Global", "description": "UWC makes education a force to unite people, nations and cultures for peace and a sustainable future.", "verified": True}
    ]
    
    for prog_data in programs:
        # Check if already exists
        existing = db.query(ProgramCatalog).filter(ProgramCatalog.name == prog_data["name"]).first()
        if not existing:
            print(f"Adding {prog_data['name']}...")
            new_prog = ProgramCatalog(**prog_data)
            db.add(new_prog)
        else:
            print(f"{prog_data['name']} already exists.")
            
    db.commit()
    db.close()
    
    from sqlalchemy import text
    # We must also fix the sequence to prevent future IntegrityError on insertion
    print("Fixing sequences...")
    db = SessionLocal()
    db.execute(text("SELECT setval('programs_catalog_id_seq', (SELECT MAX(id) FROM programs_catalog));"))
    db.commit()
    db.close()
    
    print("Programs added successfully.")

if __name__ == "__main__":
    add_programs()
