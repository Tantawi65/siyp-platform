import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.core.database import SessionLocal
from backend.models.user import User, Profile

def cleanup():
    db = SessionLocal()
    
    # Find all profiles
    profiles = db.query(Profile).all()
    orphans_deleted = 0
    
    for p in profiles:
        user = db.query(User).filter(User.id == p.user_id).first()
        if not user:
            print(f"Deleting orphaned profile {p.id} for user {p.user_id}")
            db.delete(p)
            orphans_deleted += 1
            
    db.commit()
    db.close()
    
    print(f"Cleanup complete. Deleted {orphans_deleted} orphaned profiles.")

if __name__ == "__main__":
    cleanup()
