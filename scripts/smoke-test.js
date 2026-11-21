// Smoke test for the salonbook REST API.
// Usage: node scripts/smoke-test.js   (requires the API on http://127.0.0.1:5000 and MongoDB running)
const API = 'http://127.0.0.1:5000';

function check(name, cond, extra) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}${extra ? ' — ' + extra : ''}`);
  if (!cond) process.exitCode = 1;
}

async function apiCall(path, { method = 'GET', token, body, expected } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => null);
  if (expected && res.status !== expected) {
    check(`${method} ${path}`, false, `expected ${expected}, got ${res.status}: ${JSON.stringify(data)}`);
    return null;
  }
  return { status: res.status, data };
}

async function main() {
  const health = await apiCall('/health', { expected: 200 });
  check('GET /health', health?.data?.ok === true);

  const admin = await apiCall('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@example.com', password: 'adminsaloonbook1' },
    expected: 200,
  });
  const adminToken = admin?.data?.token;
  check('admin login (env seed)', !!adminToken);

  const services = await apiCall('/api/services', { expected: 200 });
  check('GET /api/services', Array.isArray(services?.data?.services) && services.data.services.length > 0, `count=${services?.data?.services?.length}`);

  const newService = await apiCall('/api/services', {
    method: 'POST',
    token: adminToken,
    body: { name: 'Smoke Test Service', description: 'smoke', category: 'Smoke', price: 7000, durationMinutes: 30 },
    expected: 201,
  });
  const serviceId = newService?.data?.service?._id;
  check('POST /api/services (admin)', !!serviceId);

  const updated = await apiCall(`/api/services/${serviceId}`, {
    method: 'PUT',
    token: adminToken,
    body: { name: 'Smoke Test Service v2', price: 8000 },
    expected: 200,
  });
  check('PUT /api/services/:id', updated?.data?.service?.name === 'Smoke Test Service v2');

  await apiCall('/api/services', { method: 'POST', body: { name: 'x', price: 1 }, expected: 401 });
  check('POST /api/services unauthenticated → 401', true);

  const customerEmail = `smoke${Date.now()}@example.com`;
  const customer = await apiCall('/api/auth/register', {
    method: 'POST',
    body: { name: 'Smoke Customer', email: customerEmail, password: 'secret1234' },
    expected: 201,
  });
  const customerToken = customer?.data?.token;
  check('register customer', !!customerToken && customer.data.user.role === 'customer');

  const login2 = await apiCall('/api/auth/login', {
    method: 'POST',
    body: { email: customerEmail, password: 'secret1234' },
    expected: 200,
  });
  check('customer login', !!login2?.data?.token);

  const apt = await apiCall('/api/appointments', {
    method: 'POST',
    token: customerToken,
    body: { serviceId, appointmentDate: new Date(Date.now() + 86400000).toISOString() },
    expected: 201,
  });
  const appointmentId = apt?.data?.appointment?._id;
  check('POST /api/appointments', !!appointmentId && apt.data.appointment.status === 'pending');

  const list = await apiCall('/api/appointments', { token: customerToken, expected: 200 });
  check('GET /api/appointments (customer)', (list?.data?.appointments || []).some((a) => a._id === appointmentId && a.status === 'pending'));

  const confirm = await apiCall(`/api/appointments/${appointmentId}/confirm`, { method: 'PUT', token: adminToken, expected: 200 });
  check('PUT /api/appointments/:id/confirm (admin)', confirm?.data?.appointment?.status === 'confirmed');

  await apiCall(`/api/appointments/${appointmentId}/cancel`, { method: 'PUT', token: customerToken, expected: 400 });
  check('cancel confirmed (customer) blocked', true);

  const checkout = await apiCall(`/api/payments/checkout/${appointmentId}`, { method: 'POST', token: customerToken });
  check('POST /api/payments/checkout/:id → responds (non-401)', checkout?.status && checkout.status !== 401);

  const webhook = await apiCall('/api/webhooks/stripe', { method: 'POST', expected: 400 });
  check('POST /api/webhooks/stripe → 400 without signature', webhook?.status === 400);

  const payments = await apiCall('/api/payments', { token: customerToken, expected: 200 });
  check('GET /api/payments (customer)', (payments?.data?.payments || []).length >= 1);

  const customers = await apiCall('/api/customers', { token: adminToken, expected: 200 });
  check('GET /api/customers (admin)', (customers?.data?.customers || []).length >= 1);

  console.log(serviceId ? `Service ${serviceId}, appointment ${appointmentId}` : 'Smoke test done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
