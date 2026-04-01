import { next } from '@vercel/edge';

// --- Blocklists ---
// City names (matched against x-vercel-ip-city, case-insensitive)
const BLOCKED_CITIES = [
  'Wichita Falls',
];

// State/region codes (matched against x-vercel-ip-country-region)
// Example: 'TX' blocks all of Texas, 'CA' blocks California
const BLOCKED_REGIONS = [];

// Country codes (matched against x-vercel-ip-country)
// Example: 'RU', 'CN'
const BLOCKED_COUNTRIES = [];

export default function middleware(req) {
  const city = decodeURIComponent(req.headers.get('x-vercel-ip-city') || '');
  const region = req.headers.get('x-vercel-ip-country-region') || '';
  const country = req.headers.get('x-vercel-ip-country') || '';

  const blocked =
    BLOCKED_CITIES.some(c => c.toLowerCase() === city.toLowerCase()) ||
    BLOCKED_REGIONS.includes(region) ||
    BLOCKED_COUNTRIES.includes(country);

  if (blocked) {
    return new Response('Not Found', { status: 404 });
  }

  return next();
}
