const FORMSUBMIT_URL = 'https://formsubmit.co/0989700487c051bb1060f0ab6ea55ce3';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    let body = req.body ?? {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }

    const fields = { ...body };
    delete fields._next;

    console.log('Forwarding to FormSubmit, keys:', Object.keys(fields).join(', '));

    const fsRes = await fetch(FORMSUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fields).toString(),
      redirect: 'manual',
    });

    console.log('FormSubmit status:', fsRes.status);

    // FormSubmit redirects (302/303) on success — any non-4xx/5xx is success
    if (fsRes.status < 400) {
      res.status(200).json({ ok: true });
    } else {
      const text = await fsRes.text().catch(() => '');
      console.error('FormSubmit error body:', text.slice(0, 300));
      res.status(502).json({ ok: false });
    }
  } catch (err) {
    console.error('Contact handler error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
}
