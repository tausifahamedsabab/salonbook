// Admin credentials come from the server .env (or the process environment) —
// never hardcode them in a tracked test script.
require('dotenv').config({ path: require('path').join(__dirname, '../../salonbook-server/.env') });
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
const H = { 'content-type': 'application/json', origin: 'http://localhost:3000' };
let pass = 0, fail = 0;
const check = (name, cond, extra) => { if (cond) { pass++; console.log(`PASS: ${name}`); } else { fail++; console.log(`FAIL: ${name}${extra ? ' — ' + extra : ''}`); } };
async function call(path, { method = 'GET', body, expected, useCookie, cookie, allowed } = {}) {
  const sessionCookie = useCookie || cookie;
  const headers = { ...H, ...(sessionCookie ? { cookie: sessionCookie } : {}) };
  const res = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => null);
  if (expected && res.status !== expected) { check(`${method} ${path}`, false, `expected ${expected}, got ${res.status}: ${JSON.stringify(data)}`); return null; }
  if (allowed && !allowed.includes(res.status)) { check(`${method} ${path}`, false, `status ${res.status} not in ${allowed}`); return null; }
  const setCookie = res.headers.get('set-cookie')?.split(';')[0] || sessionCookie || '';
  return { status: res.status, data, cookie: setCookie };
}

async function main() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in salonbook-server/.env before running smoke tests');
  }
  check('health', (await call('/health', { expected: 200 })).data?.ok === true);

  const admin = await call('/api/auth/sign-in/email', { method: 'POST', body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }, expected: 200 });
  const adminC = admin.cookie;
  check('admin sign-in', !!adminC, `user=${admin.data?.user?.email}`);

  const stats = await call('/api/admin/stats', { cookie: adminC, expected: 200 });
  check('GET /api/admin/stats (admin)', stats.data?.stats && typeof stats.data.stats.totalCustomers === 'number' && typeof stats.data.stats.totalSuccessfulPayments === 'number');

  const txns = await call('/api/admin/transactions', { cookie: adminC, expected: 200 });
  check('GET /api/admin/transactions (admin)', Array.isArray(txns.data?.transactions));
  check('GET /api/admin/transactions unauth -> 401', (await call('/api/admin/transactions', { expected: 401 })).status === 401);

  const adminSvc = await call('/api/services/all', { cookie: adminC, expected: 200 });
  check('GET /api/services/all (admin)', Array.isArray(adminSvc.data?.services) && adminSvc.data.services.length > 0);
  const svcId = adminSvc.data.services[0]._id;

  const publicSvc = await call('/api/services', { expected: 200 });
  check('GET /api/services (public) active only', publicSvc.data.services.every((s) => s.status !== 'inactive'));

  check('create service w/o name -> 400', (await call('/api/services', { method: 'POST', cookie: adminC, body: { name: '', price: 10 }, expected: 400 })).status === 400);
  check('create service price=0 -> 400', (await call('/api/services', { method: 'POST', cookie: adminC, body: { name: 'x', price: 0 }, expected: 400 })).status === 400);

  const deact = await call(`/api/services/${svcId}/status`, { method: 'PUT', cookie: adminC, body: { status: 'inactive' }, expected: 200 });
  check('deactivate service', deact.data?.service?.status === 'inactive');
  check('inactive hidden from public', (await call(`/api/services/${svcId}`, { expected: 404 })).status === 404);
  check('reactivate service', (await call(`/api/services/${svcId}/status`, { method: 'PUT', cookie: adminC, body: { status: 'active' }, expected: 200 })).data?.service?.status === 'active');
  check('status non-string -> 400', (await call(`/api/services/${svcId}/status`, { method: 'PUT', cookie: adminC, body: { status: 'yes' }, expected: 400 })).status === 400);

  const email = `smoke${Date.now()}@example.com`;
  await call('/api/auth/sign-up/email', { method: 'POST', body: { name: 'Smoke', email, password: 'Password123' }, expected: 200 });
  const custC = (await call('/api/auth/sign-in/email', { method: 'POST', body: { email, password: 'Password123' }, expected: 200 })).cookie;
  check('customer sign-in', !!custC);

  // Try several future dates/slots so re-runs don't collide with earlier bookings.
  const slots = ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '14:00'];
  let apt = null, slot = '', date = '';
  for (let i = 0; i < 32 && !apt; i++) {
    slot = slots[i % slots.length];
    date = new Date(Date.now() + (2 + Math.floor(i / slots.length)) * 86400000 + 9 * 3600000 + i * 60000).toISOString();
    const candidate = await call('/api/appointments', {
      method: 'POST', useCookie: custC,
      body: { serviceId: svcId, appointmentDate: `${date.slice(0, 10)}T${slot}`, timeSlot: slot, message: 'smoke' },
    });
    if (candidate?.status === 201) apt = candidate;
  }
  check('book appointment', apt?.data?.appointment?.status === 'pending' && apt?.data?.appointment?.paymentStatus === 'unpaid' && apt?.data?.appointment?.timeSlot === slot);
  if (!apt) throw new Error('Could not book a smoke appointment after 32 attempts');
  const aptId = apt.data.appointment._id;
  check('duplicate same slot -> 409', (await call('/api/appointments', { method: 'POST', useCookie: custC, body: { serviceId: svcId, appointmentDate: `${date.slice(0, 10)}T${slot}`, timeSlot: slot }, allowed: [409] })).status === 409);
  const aptP = apt.data?.appointment;

  const payList = await call('/api/payments', { useCookie: custC, expected: 200 });
  const paymentId = payList.data?.payments?.find((p) => p.appointmentId === aptId)?._id;
  check('payment found for appointment', !!paymentId, `apt=${aptId}`);
  const verify = await call(`/api/payments/${paymentId}/verify`, { useCookie: custC, expected: 200 });
  check('verify payment endpoint answers', verify.status === 200 && typeof verify.data?.paid === 'boolean');

  const confirm = await call(`/api/appointments/${aptId}/confirm`, { method: 'PUT', cookie: adminC, expected: 200 });
  check('confirm appointment (admin)', confirm.data?.appointment?.status === 'confirmed');

  // Checkout is only available after confirmation (200 with Stripe, 503 without).
  const pay = await call(`/api/payments/checkout/${aptId}`, { method: 'POST', useCookie: custC });
  check('checkout answers (503 when Stripe unconfigured)', pay.status === 503 || pay.status === 200, `status=${pay.status}`);
  check('customer cannot cancel confirmed -> 400', (await call(`/api/appointments/${aptId}/cancel`, { method: 'PUT', useCookie: custC }, { allowed: [400] })).status === 400);
  check('admin cancels confirmed appointment', (await call(`/api/appointments/${aptId}/cancel`, { method: 'PUT', cookie: adminC, expected: 200 })).data.appointment.status === 'cancelled');

  check('admin lists customers', (await call('/api/customers', { cookie: adminC, expected: 200 })).data.customers.some((c) => c.email === email));

  const customers = await call('/api/customers', { cookie: adminC, expected: 200 });
  const custRow = customers.data.customers.find((c) => c.email === email);
  const block = await call(`/api/customers/${custRow._id}/block`, { method: 'POST', cookie: adminC, expected: 200 });
  check('block user', block.data?.user?.isBlocked === true);
  check('blocked user -> 403', (await call('/api/appointments', { useCookie: custC })).status === 403);
  check('unblock user', (await call(`/api/customers/${custRow._id}/unblock`, { method: 'POST', cookie: adminC, expected: 200 })).data.user.isBlocked === false);

  console.log(`\nSmoke: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch((err) => { console.error(err); process.exit(1); });
