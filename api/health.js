export async function handler() {
  // Minimal env diagnostics endpoint (do NOT return secret values).
  const databaseUrlSet = Boolean(process.env.DATABASE_URL);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ok: true,
      databaseUrlSet,
    }),
  };
}
