const FORMSUBMIT_URL = 'https://formsubmit.co/0989700487c051bb1060f0ab6ea55ce3';
const SUCCESS_REDIRECT = 'https://natependley.com/?contact=success#contact';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  // Strip _next — we handle the redirect ourselves
  const fields = { ...req.body };
  delete fields._next;

  const response = await fetch(FORMSUBMIT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  });

  if (response.ok) {
    res.redirect(303, SUCCESS_REDIRECT);
  } else {
    res.status(502).end('Submission failed. Please try again.');
  }
}
