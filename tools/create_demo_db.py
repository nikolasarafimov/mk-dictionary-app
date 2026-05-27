import sqlite3
from pathlib import Path

SOURCE_DB = Path("public/msd-mk.sqlite")
DEMO_DB = Path("public/msd-mk-demo.sqlite")

ROWS_PER_TABLE = 30000

if not SOURCE_DB.exists():
    raise FileNotFoundError(f"Source database not found: {SOURCE_DB}")

if DEMO_DB.exists():
    DEMO_DB.unlink()

src = sqlite3.connect(SOURCE_DB)
dst = sqlite3.connect(DEMO_DB)

src.row_factory = sqlite3.Row

print("Creating demo database...")

tables = src.execute("""
    SELECT name, sql
    FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
""").fetchall()

for table in tables:
    table_name = table["name"]
    create_sql = table["sql"]

    print(f"Creating table: {table_name}")
    dst.execute(create_sql)

    rows = src.execute(
        f'SELECT * FROM "{table_name}" LIMIT {ROWS_PER_TABLE}'
    ).fetchall()

    if rows:
        columns = rows[0].keys()
        column_names = ", ".join([f'"{col}"' for col in columns])
        placeholders = ", ".join(["?"] * len(columns))

        insert_sql = f'''
            INSERT INTO "{table_name}" ({column_names})
            VALUES ({placeholders})
        '''

        dst.executemany(
            insert_sql,
            [tuple(row[col] for col in columns) for row in rows]
        )

    print(f"Copied {len(rows)} rows from {table_name}")

indexes = src.execute("""
    SELECT name, sql
    FROM sqlite_master
    WHERE type = 'index'
      AND sql IS NOT NULL
""").fetchall()

for index in indexes:
    try:
        dst.execute(index["sql"])
        print(f"Created index: {index['name']}")
    except Exception as e:
        print(f"Skipped index {index['name']}: {e}")

dst.commit()
src.close()
dst.close()

size_mb = DEMO_DB.stat().st_size / (1024 * 1024)
print(f"Demo database created: {DEMO_DB}")
print(f"Demo database size: {size_mb:.2f} MB")