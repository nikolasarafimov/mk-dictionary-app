
import process from 'node:process'
import { createClient } from '@libsql/client/web'

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url || !authToken) {
    return Response.json(
      {
        ok: false,
        error: 'Database configuration is missing.',
      },
      { status: 503 },
    )
  }

  try {
    const database = createClient({
      url,
      authToken,
    })

    const result = await database.execute(
      'SELECT COUNT(*) AS count FROM words'
    )

    return Response.json(
      {
        ok: true,
        database: 'mk-dictionary-full',
        wordForms: Number(result.rows[0]?.count ?? 0),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    )
  } catch (error) {
    console.error('Database connection failed:', error.name)

    return Response.json(
      {
        ok: false,
        error: 'Database query failed.',
      },
      { status: 502 },
    )
  }
}
