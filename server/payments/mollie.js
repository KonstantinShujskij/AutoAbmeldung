// Mollie-Zahlung. Direkt über die REST-API (wie Telegram), ohne SDK.
//
// Token aus .env (MOLLIE_TOKEN):
//   - access_… = Organization Access Token (OAT): profileId und testmode sind Pflicht.
//   - test_… / live_… = klassischer API-Key: Modus steckt im Key, kein profileId nötig.
// Ohne Token ODER ohne PUBLIC_URL (für redirect/webhook) ist Zahlung aus.

const API = 'https://api.mollie.com/v2';

const token = () => process.env.MOLLIE_TOKEN || '';
const isOAT = () => token().startsWith('access_');
// Beim OAT ist der Modus nicht im Token — hier explizit (Default: Testmodus, bis MOLLIE_TESTMODE=false).
const testmode = () => process.env.MOLLIE_TESTMODE !== 'false';
const price = () => process.env.SERVICE_PRICE || '29.99';
const site = () => (process.env.PUBLIC_URL || '').replace(/\/+$/, '');

export const mollieEnabled = () => Boolean(token() && site());
export const serviceAmount = () => ({ value: price(), currency: 'EUR' });

async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { authorization: `Bearer ${token()}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Mollie ${method} ${path}: ${json.detail || json.title || res.status}`);
  return json;
}

// OAT braucht eine profileId. Einmal holen (oder aus MOLLIE_PROFILE_ID) und merken.
let profileCache = null;
async function profileId() {
  if (!isOAT()) return undefined;
  if (process.env.MOLLIE_PROFILE_ID) return process.env.MOLLIE_PROFILE_ID;
  if (profileCache) return profileCache;
  const list = await api('GET', `/profiles?testmode=${testmode()}`);
  profileCache = list?._embedded?.profiles?.[0]?.id;
  if (!profileCache) throw new Error('kein Mollie-Profil gefunden');
  return profileCache;
}

/** Legt eine Zahlung an und gibt die zu speichernden Felder zurück (inkl. checkoutUrl). */
export async function createPayment(record) {
  const body = {
    amount: serviceAmount(),
    description: `Fahrzeugabmeldung ${record.id}`,
    redirectUrl: `${site()}/danke?id=${encodeURIComponent(record.id)}`,
    webhookUrl: `${site()}/api/mollie/webhook`,
    metadata: { orderId: record.id },
  };
  if (isOAT()) {
    body.profileId = await profileId();
    body.testmode = testmode();
  }
  const p = await api('POST', '/payments', body);
  return {
    provider: 'mollie',
    id: p.id,
    status: p.status,
    amount: p.amount?.value,
    currency: p.amount?.currency,
    checkoutUrl: p._links?.checkout?.href ?? null,
    createdAt: new Date().toISOString(),
  };
}

/** Holt den aktuellen Status einer Zahlung (Webhook schickt nur die id — Wahrheit kommt per API). */
export async function fetchPayment(id) {
  const q = isOAT() ? `?testmode=${testmode()}` : '';
  const p = await api('GET', `/payments/${encodeURIComponent(id)}${q}`);
  return {
    id: p.id,
    status: p.status, // open | paid | canceled | expired | failed | pending
    orderId: p.metadata?.orderId ?? null,
    amount: p.amount?.value,
    currency: p.amount?.currency,
  };
}
