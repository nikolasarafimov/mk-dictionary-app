
import sqlite3
from contextlib import closing
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]

SOURCE_DB = PROJECT_ROOT / "public" / "msd-mk.sqlite"
DEMO_DB = PROJECT_ROOT / "public" / "msd-mk-demo.sqlite"
TEMP_DB = PROJECT_ROOT / "public" / "msd-mk-demo.tmp.sqlite"

TOTAL_DEMO_ROWS = 30_000

MACEDONIAN_LETTERS = (
    "А", "Б", "В", "Г", "Д", "Ѓ", "Е", "Ж",
    "З", "Ѕ", "И", "Ј", "К", "Л", "Љ",
    "М", "Н", "Њ", "О", "П", "Р", "С",
    "Т", "Ќ", "У", "Ф", "Х", "Ц", "Ч",
    "Џ", "Ш",
)


def quote_identifier(identifier):
    escaped = identifier.replace('"', '""')
    return f'"{escaped}"'


def verify_source_database_file():
    if not SOURCE_DB.is_file():
        raise FileNotFoundError(
            f"Source database was not found: {SOURCE_DB}"
        )

    with SOURCE_DB.open("rb") as source_file:
        header = source_file.read(16)

    if header != b"SQLite format 3\x00":
        raise RuntimeError(
            "The source file is not a valid SQLite database. "
            "If it is managed by Git LFS, run "
            "'git lfs pull' before generating the demo database."
        )


def get_table_sql(connection, table_name):
    row = connection.execute(
        """
        SELECT sql
        FROM sqlite_master
        WHERE type = 'table'
          AND name = ?
        """,
        (table_name,),
    ).fetchone()

    if not row or not row[0]:
        raise RuntimeError(
            f"Table {table_name!r} was not found "
            "in the source database."
        )

    return row[0]


def get_table_columns(connection, table_name):
    quoted_table = quote_identifier(table_name)

    rows = connection.execute(
        f"PRAGMA table_info({quoted_table})"
    ).fetchall()

    columns = [row[1] for row in rows]

    if not columns:
        raise RuntimeError(
            f"Could not determine columns "
            f"for table {table_name!r}."
        )

    return columns


def copy_words(source, destination):
    table_name = "words"

    create_sql = get_table_sql(
        source,
        table_name,
    )

    columns = get_table_columns(
        source,
        table_name,
    )

    required_columns = {
        "form",
        "lemma",
        "tag",
    }

    missing_columns = required_columns - set(columns)

    if missing_columns:
        missing = ", ".join(sorted(missing_columns))

        raise RuntimeError(
            f"The words table is missing "
            f"required columns: {missing}"
        )

    destination.execute(create_sql)

    quoted_columns = ", ".join(
        quote_identifier(column)
        for column in columns
    )

    placeholders = ", ".join(
        "?" for _ in columns
    )

    insert_sql = (
        f'INSERT INTO "words" ({quoted_columns}) '
        f"VALUES ({placeholders})"
    )

    rows_per_letter = (
        TOTAL_DEMO_ROWS // len(MACEDONIAN_LETTERS)
    )

    remainder = (
        TOTAL_DEMO_ROWS % len(MACEDONIAN_LETTERS)
    )

    total_copied = 0

    print(
        "Creating representative "
        "Macedonian dictionary sample..."
    )

    for index, letter in enumerate(MACEDONIAN_LETTERS):
        limit = rows_per_letter

        if index < remainder:
            limit += 1

        rows = source.execute(
            f"""
            SELECT {quoted_columns}
            FROM "words"
            WHERE substr("form", 1, 1) IN (?, ?)
            ORDER BY rowid
            LIMIT ?
            """,
            (
                letter,
                letter.lower(),
                limit,
            ),
        ).fetchall()

        if not rows:
            raise RuntimeError(
                "The source database contains no word forms "
                f"beginning with the letter {letter!r}."
            )

        destination.executemany(
            insert_sql,
            rows,
        )

        copied = len(rows)
        total_copied += copied

        print(
            f"{letter}: copied {copied:,} rows"
        )

    print(
        f"Copied {total_copied:,} dictionary rows in total."
    )

    return total_copied


def copy_word_indexes(source, destination):
    indexes = source.execute(
        """
        SELECT name, sql
        FROM sqlite_master
        WHERE type = 'index'
          AND tbl_name = 'words'
          AND sql IS NOT NULL
        ORDER BY name
        """
    ).fetchall()

    for name, sql in indexes:
        destination.execute(sql)
        print(f"Created index: {name}")


def validate_demo_database(connection, expected_rows):
    row = connection.execute(
        "SELECT COUNT(*) FROM words"
    ).fetchone()

    actual_rows = row[0] if row else 0

    if actual_rows != expected_rows:
        raise RuntimeError(
            "Demo database validation failed: "
            f"expected {expected_rows:,} rows, "
            f"found {actual_rows:,}."
        )

    if actual_rows == 0 or actual_rows > TOTAL_DEMO_ROWS:
        raise RuntimeError(
            "Demo database contains an invalid number "
            f"of rows: {actual_rows:,}."
        )

    letters_found = {
        str(row[0]).upper()
        for row in connection.execute(
            """
            SELECT DISTINCT substr(form, 1, 1)
            FROM words
            WHERE form IS NOT NULL
              AND form != ''
            """
        ).fetchall()
        if row[0]
    }

    missing_letters = [
        letter
        for letter in MACEDONIAN_LETTERS
        if letter not in letters_found
    ]

    if missing_letters:
        missing = ", ".join(missing_letters)

        raise RuntimeError(
            "Demo database alphabet validation failed. "
            f"Missing Macedonian letters: {missing}"
        )

    integrity_row = connection.execute(
        "PRAGMA quick_check"
    ).fetchone()

    if not integrity_row or integrity_row[0] != "ok":
        details = (
            integrity_row[0]
            if integrity_row
            else "No integrity check result"
        )

        raise RuntimeError(
            "Demo database integrity check failed: "
            f"{details}"
        )

    print(
        "Alphabet coverage: "
        f"{len(MACEDONIAN_LETTERS)}/"
        f"{len(MACEDONIAN_LETTERS)} letters"
    )

    print("SQLite integrity check: OK")

    return actual_rows


def create_demo_database():
    if TOTAL_DEMO_ROWS < len(MACEDONIAN_LETTERS):
        raise ValueError(
            "TOTAL_DEMO_ROWS must be at least "
            "the number of Macedonian alphabet letters."
        )

    verify_source_database_file()

    TEMP_DB.unlink(missing_ok=True)

    print(f"Source database: {SOURCE_DB}")
    print(f"Target demo database: {DEMO_DB}")

    try:
        source_uri = (
            f"{SOURCE_DB.resolve().as_uri()}?mode=ro"
        )

        with closing(
            sqlite3.connect(source_uri, uri=True)
        ) as source:
            with closing(
                sqlite3.connect(TEMP_DB)
            ) as destination:
                destination.execute(
                    "PRAGMA journal_mode = DELETE"
                )

                destination.execute(
                    "PRAGMA synchronous = NORMAL"
                )

                destination.execute("BEGIN")

                copied_rows = copy_words(
                    source,
                    destination,
                )

                copy_word_indexes(
                    source,
                    destination,
                )

                destination.commit()

                destination.execute("ANALYZE")
                destination.commit()

        temp_uri = (
            f"{TEMP_DB.resolve().as_uri()}?mode=ro"
        )

        with closing(
            sqlite3.connect(temp_uri, uri=True)
        ) as validation_connection:
            validate_demo_database(
                validation_connection,
                copied_rows,
            )

        TEMP_DB.replace(DEMO_DB)

    except Exception:
        TEMP_DB.unlink(missing_ok=True)
        raise

    size_mb = (
        DEMO_DB.stat().st_size / (1024 * 1024)
    )

    print()
    print("Demo database created successfully.")
    print(f"Rows: {copied_rows:,}")
    print(f"Size: {size_mb:.2f} MB")
    print(f"Output: {DEMO_DB}")


if __name__ == "__main__":
    create_demo_database()
