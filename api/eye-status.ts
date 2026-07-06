import type { VercelRequest, VercelResponse } from '@vercel/node';

// multipart/form-data (binary) 를 그대로 전달해야 하므로 body parser 비활성화
export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const apiUrl = process.env.EYE_STATUS_API_URL;
  if (!apiUrl) {
    return res.status(503).json({ error: 'EYE_STATUS_API_URL is not configured' });
  }

  // raw body 수집
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const body = Buffer.concat(chunks);

  try {
    const upstream = await fetch(`${apiUrl}/v1/eye-status`, {
      method: 'POST',
      headers: {
        'content-type': req.headers['content-type'] ?? '',
      },
      body,
      signal: AbortSignal.timeout(3000),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'upstream error';
    return res.status(502).json({ error: message });
  }
}
