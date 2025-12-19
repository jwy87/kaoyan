import mysql from 'mysql2/promise';

let pool;
let dbReady = false;

function getPool() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
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

export default async function handler(req, res) {
  try {
    const pool = getPool();

    if (req.method === 'GET') {
      if (!pool) return res.status(200).json([]);
      await ensureDb(pool);
      const [rows] = await pool.query(
        'SELECT content FROM blessings ORDER BY created_at DESC LIMIT 100'
      );
      return res.status(200).json(rows.map((row) => row.content));
    }

    if (req.method === 'POST') {
      const content = req.body?.content;
      if (!content || typeof content !== 'string' || content.length > 50) {
        return res.status(400).json({ error: 'Invalid content' });
      }

      if (pool) {
        await ensureDb(pool);
        await pool.query('INSERT INTO blessings (content) VALUES (?)', [content]);
      }

      return res.status(201).json({ message: 'Blessing saved' });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
