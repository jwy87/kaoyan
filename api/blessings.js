import mysql from 'mysql2/promise';

let pool;
let dbReady = false;

function getPool() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn('DATABASE_URL is missing; blessings API will run without DB.');
    return null;
  }
  if (!pool) {
    pool = mysql.createPool(url);
  }
  return pool;
}

async function ensureDb(pool) {
  if (dbReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS blessings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      content VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  dbReady = true;
}

const json = (statusCode, data, extraHeaders = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...extraHeaders,
  },
  body: JSON.stringify(data),
});

export async function handler(event) {
  try {
    const pool = getPool();
    const method = event?.httpMethod || 'GET';

    if (method === 'GET') {
      if (!pool) return json(200, []);
      await ensureDb(pool);
      const [rows] = await pool.query(
        `
        SELECT content, MAX(created_at) AS latest
        FROM blessings
        GROUP BY content
        ORDER BY latest DESC
        LIMIT 100
        `
      );
      return json(
        200,
        rows.map((row) => row.content)
      );
    }

    if (method === 'POST') {
      let parsedBody = null;
      try {
        parsedBody = event?.body ? JSON.parse(event.body) : null;
      } catch {
        return json(400, { error: 'Invalid JSON body' });
      }

      const content = parsedBody?.content;
      if (!content || typeof content !== 'string' || content.length > 50) {
        return json(400, { error: 'Invalid content' });
      }

      if (pool) {
        await ensureDb(pool);
        await pool.query('INSERT INTO blessings (content) VALUES (?)', [content]);
      }

      return json(201, { message: 'Blessing saved' });
    }

    return json(
      405,
      { error: 'Method Not Allowed' },
      { Allow: 'GET, POST' }
    );
  } catch (error) {
    console.error('API error:', error);
    return json(500, { error: 'Internal Server Error' });
  }
}

