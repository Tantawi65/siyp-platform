import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv("backend/.env")
db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("NO DB URL")
    exit(1)

engine = create_engine(db_url)
with engine.connect() as conn:
    tables = ["users", "opportunities", "programs_catalog"]
    for t in tables:
        try:
            res = conn.execute(text(f"SELECT setval(pg_get_serial_sequence('{t}', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM {t};"))
            print(f"Fixed sequence for {t}: {res.scalar()}")
            conn.commit()
        except Exception as e:
            print(f"Error on {t}: {e}")
