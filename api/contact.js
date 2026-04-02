const FORMSUBMIT_AJAX_URL = 'https://formsubmit.co/ajax/0989700487c051bb1060f0ab6ea55ce3';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    // Parse body manually if Vercel hasn't already done it
    let body = req.body;
    if (!body || typeof body === 'string') {
      const raw = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      body = JSON.parse(raw);
    }

    // Strip redirect/meta fields — not needed for AJAX submissions
    const { _next, _captcha, _template, submittedAt, ...fields } = body;

    const response = await fetch(FORMSUBMIT_AJAX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://www.natependley.com',
      },
      body: JSON.stringify(fields),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.success) {
      res.status(200).json({ ok: true });
    } else {
      res.status(502).json({ ok: false, error: data.message || 'Submission failed' });
    }
  } catch (err) {
    console.error('Contact handler error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
