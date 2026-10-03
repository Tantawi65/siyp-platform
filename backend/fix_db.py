import os
import psycopg

url = os.environ.get('DATABASE_URL')
if not url:
    url = "postgresql://neondb_owner:npg_u1vQyB0YjCqN@ep-muddy-glade-a23qsh5a-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"

with psycopg.connect(url) as conn:
    with conn.cursor() as cur:
        tables = ['users', 'profiles', 'opportunities', 'saved_opportunities', 'tags', 'categories', 'programs']
        for table in tables:
            try:
                # Find the sequence name for the id column manually
                cur.execute(f"SELECT column_default FROM information_schema.columns WHERE table_name='{table}' AND column_name='id'")
                row = cur.fetchone()
                if row and row[0] and 'nextval' in row[0]:
                    seq_name = row[0].split("'")[1]
                    cur.execute(f"SELECT setval('{seq_name}', COALESCE((SELECT MAX(id) FROM {table}), 1))")
                    val = cur.fetchone()[0]
                    print(f"Fixed {table} sequence to {val}")
                else:
                    print(f"No sequence found for {table}")
            except Exception as e:
                print(f"Error on {table}:", e)
                conn.rollback() # Rollback on error so subsequent tables can be processed
