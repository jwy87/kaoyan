export default async function handler(req, res) {
  // Minimal env diagnostics endpoint (do NOT return secret values).
  const databaseUrlSet = Boolean(process.env.DATABASE_URL);

  return res.status(200).json({
    ok: true,
    databaseUrlSet,
  });
}
