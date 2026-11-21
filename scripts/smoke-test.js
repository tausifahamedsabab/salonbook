// Smoke test for the salonbook REST API (Better Auth).
// Usage: node scripts/smoke-test.js
// Requires the API on http://127.0.0.1:5000 (Better Auth, MongoDB running, admin seeded).
const API = 'http://127.0.0.1:5000';
const HEADERS = { 'content-type': 'application/json', origin: 'http://localhost:3000' };

function check(name, cond, extra) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}${extra ? ' — ' + extra : ''}`);
  if (!cond) process.exitCode = 1;
}

async function apiCall(path, { method = 'GET', body, expected, useCookie } = {}) {
  const headers = { ...HEADERS };
  if (useCookie) headers.cookie = useCookie;
  const res = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => null);
  if (expected && res.status !== expected) {
    check(`${method} ${path}`, false, `expected ${expected}, got ${res.status}: ${JSON.stringify(data)}`);
    return null;
  }
  const cookie = res.headers.get('set-cookie')?.split(';')[0] ?? '';
  return { status: res.status, data, cookie };
}

async function main() {
  const health = await apiCall('/health', { expected: 200 });
  check('GET /health', health?.data?.ok === true);

  // Admin sign-in (seeded via ADMIN_EMAIL/ADMIN_PASSWORD).
  const adminSignIn = await apiCall('/api/auth/sign-in/email', {
    method: 'POST',
    body: { email: 'admin@example.com', password: 'adminsaloonbook1' },
    expected: 200,
  });
  check('admin sign-in', !!adminSignIn?.cookie, `user=${adminSignIn?.data?.user?.email}`);
  const adminCookie = adminSignIn?.cookie;

  const services = await apiCall('/api/services', { expected: 200 });
  check('GET /api/services', Array.isArray(services?.data?.services) && services.data.services.length > 0, `count=${services?.data?.services?.length}`);

  const newService = await apiCall('/api/services', {
    method: 'POST',
    useCookie: adminCookie,
    body: { name: 'Smoke Test Service', description: 'smoke', category: 'Smoke', price: 7000, durationMinutes: 30 },
    expected: 201,
  });
  const serviceId = newService?.data?.service?._id;
  check('POST /api/services (admin)', !!serviceId);

  const updated = await apiCall(`/api/services/${serviceId}`, {
    method: 'PUT',
    useCookie: adminCookie,
    body: { name: 'Smoke Test Service v2', price: 8000 },
    expected: 200,
  });
  check('PUT /api/services/:id', updated?.data?.service?.name === 'Smoke Test Service v2');

  await apiCall('/api/services', { method: 'POST', body: { name: 'x', price: 1 }, expected: 401 });
  check('POST /api/services unauthenticated -> 401', true);

  const customerEmail = `smoke${Date.now()}@example.com`;
  const customerSignUp = await apiCall('/api/auth/sign-up/email', {
    method: 'POST',
    body: { name: 'Smoke Customer', email: customerEmail, password: 'Password123', role: 'customer' },
    expected: 200,
  });
  check('sign-up customer', !!customerSignUp?.data?.user?.id);

  const customerSignIn = await apiCall('/api/auth/sign-in/email', {
    method: 'POST',
    body: { email: customerEmail, password: 'Password123' },
    expected: 200,
  });
  const customerCookie = customerSignIn?.cookie;
  check('sign-in customer', !!customerCookie);

  const apt = await apiCall('/api/appointments', {
    method: 'POST',
    useCookie: customerCookie,
    body: { serviceId, appointmentDate: new Date(Date.now() + 86400000).toISOString() },
    expected: 201,
  });
  const appointmentId = apt?.data?.appointment?._id;
  check('POST /api/appointments', !!appointmentId && apt.data.appointment.status === 'pending');

  const list = await apiCall('/api/appointments', { useCookie: customerCookie, expected: 200 });
  check(
    'GET /api/appointments (customer)',
    (list?.data?.appointments || []).some((a) => a._id === appointmentId && a.status === 'pending')
  );

  const confirm = await apiCall(`/api/appointments/${appointmentId}/confirm`, {
    method: 'PUT',
    useCookie: adminCookie,
    expected: 200,
  });
  check('confirm appointment (admin)', confirm?.data?.appointment?.status === 'confirmed');

  const cancelConfirmed = await apiCall(`/api/appointments/${appointmentId}/cancel`, {
    method: 'PUT',
    useCookie: customerCookie,
    expected: 400,
  });
  check('cancel confirmed (customer) blocked', cancelConfirmed?.status === 400);

  const payments = await apiCall('/api/payments', { useCookie: customerCookie, expected: 200 });
  check('GET /api/payments (customer)', (payments?.data?.payments || []).length >= 1);

  const customers = await apiCall('/api/customers', { useCookie: adminCookie, expected: 200 });
  check('GET /api/customers (admin)', (customers?.data?.customers || []).length >= 1);

  console.log('Smoke test done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
