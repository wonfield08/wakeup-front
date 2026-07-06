import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const apiUrl = process.env.EYE_STATUS_API_URL;
  if (!apiUrl) {
    return res.status(503).json({ status: 'offline', reason: 'EYE_STATUS_API_URL not set' });
  }

  try {
    const upstream = await fetch(`${apiUrl}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch {
    return res.status(503).json({ status: 'offline' });
  }
}
