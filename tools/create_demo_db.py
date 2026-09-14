import sqlite3
from contextlib import closing
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]

SOURCE_DB = PROJECT_ROOT / "public" / "msd-mk.sqlite"
DEMO_DB = PROJECT_ROOT / "public" / "msd-mk-demo.sqlite"
TEMP_DB = PROJECT_ROOT / "public" / "msd-mk-demo.tmp.sqlite"

TOTAL_DEMO_ROWS = 30_000

MACEDONIAN_LETTERS = (
    "А",
    "Б",
    "В",
    "Г",
    "Д",
    "Ѓ",
    "Е",
    "Ж",
    "З",
    "Ѕ",
    "И",
    "Ј",
    "К",
    "Л",
    "Љ",
    "М",
    "Н",
    "Њ",
    "О",
    "П",
    "Р",
    "С",
    "Т",
    "Ќ",
    "У",
    "Ф",
    "Х",
    "Ц",
    "Ч",
    "Џ",
    "Ш",
)


def quote_identifier(identifier):
    return f'"{identifier.replace(chr(34), chr(34) * 2)}"'


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
            f"Table {table_name!r} was not found in the source database."
        )

    return row[0]


def get_table_columns(connection, table_name):
    quoted_table = quote_identifier(table_name)

    rows = connection.execute(
        f"PRAGMA table_info({quoted_table})"
    ).fetchall()

    columns = [
        row[1]
        for row in rows
    ]

    if not columns:
        raise RuntimeError(
            f"Could not determine columns for table {table_name!r}."
        )

    return columns


def copy_words(source, destination):
    table_name = "words"

    create_sql = get_table_sql(
        source,
        table_name,
    )

    destination.execute(create_sql)

    columns = get_table_columns(
        source,
        table_name,
    )

    required_columns = {
        "form",
        "lemma",
        "tag",
    }

    missing_columns = (
        required_columns
        - set(columns)
    )

    if missing_columns:
        missing = ", ".join(
            sorted(missing_columns)
        )

        raise RuntimeError(
            f"The words table is missing required columns: {missing}"
        )

    quoted_columns = ", ".join(
        quote_identifier(column)
        for column in columns
    )

    placeholders = ", ".join(
        "?"
        for _ in columns
    )

    insert_sql = (
        f'INSERT INTO "words" '
        f"({quoted_columns}) "
        f"VALUES ({placeholders})"
    )

    rows_per_letter = (
        TOTAL_DEMO_ROWS
        // len(MACEDONIAN_LETTERS)
    )

    remainder = (
        TOTAL_DEMO_ROWS
        % len(MACEDONIAN_LETTERS)
    )

    total_copied = 0

    print(
        "Creating representative "
        "Macedonian dictionary sample..."
    )

    for index, letter in enumerate(
        MACEDONIAN_LETTERS
    ):
        limit = rows_per_letter

        if index < remainder:
            limit += 1

        lowercase_letter = (
            letter.lower()
        )

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
                lowercase_letter,
                limit,
            ),
        ).fetchall()

        destination.executemany(
            insert_sql,
            rows,
        )

        copied = len(rows)
        total_copied += copied

        print(
            f"{letter}: copied "
            f"{copied:,} rows"
        )

    print(
        f"Copied {total_copied:,} "
        "dictionary rows in total."
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

        print(
            f"Created index: {name}"
        )


def validate_demo_database(
    connection,
    expected_rows,
):
    row = connection.execute(
        """
        SELECT COUNT(*)
        FROM words
        """
    ).fetchone()

    actual_rows = (
        row[0]
        if row
        else 0
    )

    if actual_rows != expected_rows:
        raise RuntimeError(
            "Demo database validation failed: "
            f"expected {expected_rows:,} rows, "
            f"found {actual_rows:,}."
        )

    letters_found = {
        row[0]
        for row in connection.execute(
            """
            SELECT DISTINCT
                substr(form, 1, 1)
            FROM words
            WHERE form IS NOT NULL
              AND form != ''
            """
        ).fetchall()
    }

    available_letters = [
        letter
        for letter in MACEDONIAN_LETTERS
        if (
            letter in letters_found
            or letter.lower() in letters_found
        )
    ]

    print(
        "Alphabet coverage: "
        f"{len(available_letters)}/"
        f"{len(MACEDONIAN_LETTERS)} letters"
    )


def create_demo_database():
    if not SOURCE_DB.exists():
        raise FileNotFoundError(
            f"Source database not found: "
            f"{SOURCE_DB}"
        )

    if TEMP_DB.exists():
        TEMP_DB.unlink()

    print(
        f"Source database: {SOURCE_DB}"
    )

    print(
        f"Target demo database: {DEMO_DB}"
    )

    try:
        with closing(
            sqlite3.connect(SOURCE_DB)
        ) as source:
            with closing(
                sqlite3.connect(TEMP_DB)
            ) as destination:
                destination.execute(
                    "PRAGMA journal_mode = DELETE"
                )

                destination.execute(
                    "PRAGMA synchronous = OFF"
                )

                destination.execute(
                    "BEGIN"
                )

                copied_rows = copy_words(
                    source,
                    destination,
                )

                copy_word_indexes(
                    source,
                    destination,
                )

                destination.commit()

                validate_demo_database(
                    destination,
                    copied_rows,
                )

                destination.execute(
                    "ANALYZE"
                )

                destination.commit()

        if DEMO_DB.exists():
            DEMO_DB.unlink()

        TEMP_DB.replace(
            DEMO_DB
        )

    except Exception:
        if TEMP_DB.exists():
            TEMP_DB.unlink()

        raise

    size_mb = (
        DEMO_DB.stat().st_size
        / (1024 * 1024)
    )

    print()
    print(
        "Demo database created successfully."
    )

    print(
        f"Rows: {copied_rows:,}"
    )

    print(
        f"Size: {size_mb:.2f} MB"
    )


if __name__ == "__main__":
    create_demo_database()