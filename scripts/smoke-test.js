// Smoke test for the salonbook REST API (Better Auth).
// Usage: node scripts/smoke-test.js
// Requires the API on http://127.0.0.1:5000.
const API = 'http://127.0.0.1:5000';
const HEADERS = { 'content-type': 'application/json', origin: 'http://localhost:3000' };

function check(name, cond, extra) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}${extra ? ' — ' + extra : ''}`);
  if (!cond) process.exitCode = 1;
}

async function apiCall(path, { method = 'GET', body, expected, useCookie, cookie, allowed } = {}) {
  const sessionCookie = useCookie || cookie;
  const headers = { ...HEADERS };
  if (sessionCookie) headers.cookie = sessionCookie;
  const res = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => null);
  if (expected && res.status !== expected) {
    check(`${method} ${path}`, false, `expected ${expected}, got ${res.status}: ${JSON.stringify(data)}`);
    return null;
  }
  if (allowed && !allowed.includes(res.status)) {
    check(`${method} ${path}`, false, `status ${res.status} not in ${allowed}`);
    return null;
  }
  const setCookie = res.headers.get('set-cookie')?.split(';')[0] || sessionCookie || '';
  return { status: res.status, data, cookie: setCookie };
}

async function main() {
  // --- Health & roles ---
  const health = await apiCall('/health', { expected: 200 });
  check('GET /health', health?.data?.ok === true);

  const statsDenied = await apiCall('/api/admin/stats', { expected: 401 });
  check('GET /api/admin/stats unauth -> 401', true);

  // --- Admin login ---
  const adminSignIn = await apiCall('/api/auth/sign-in/email', {
    method: 'POST',
    body: { email: 'admin@example.com', password: 'adminsaloonbook1' },
    expected: 200,
  });
  check('admin sign-in', !!adminSignIn?.cookie, `user=${adminSignIn?.data?.user?.email}`);
  const adminC = adminSignIn?.cookie;

  // --- Admin dashboard stats ---
  const stats = await apiCall('/api/admin/stats', { cookie: adminC, expected: 200 });
  check('GET /api/admin/stats (admin)', !!stats?.data?.stats && typeof stats.data.stats.totalCustomers === 'number');

  // --- Service validation rules ---
  const adminSvc = await apiCall('/api/services/all', { cookie: adminC, expected: 200 });
  check('GET /api/services/all (admin)', Array.isArray(adminSvc?.data?.services) && adminSvc.data.services.length > 0);
  const svcId = adminSvc.data.services[0]._id;

  const badName = await apiCall('/api/services', { method: 'POST', cookie: adminC, body: { name: '', price: 100 }, expected: 400 });
  check('create service without name -> 400', true);
  const zeroPrice = await apiCall('/api/services', { method: 'POST', cookie: adminC, body: { name: 'X', price: 0 }, expected: 400 });
  check('create service price=0 -> 400', true);
  const zeroDur = await apiCall('/api/services', { method: 'POST', cookie: adminC, body: { name: 'X', price: 50, durationMinutes: 0 }, expected: 400 });
  check('create service duration=0 -> 400', true);
  const unauthSvc = await apiCall('/api/services', { method: 'POST', body: { name: 'X', price: 50 }, expected: 401 });
  check('create service unauth -> 401', true);

  // --- Activate / deactivate ---
  const deact = await apiCall(`/api/services/${svcId}/status`, { method: 'PUT', cookie: adminC, body: { isActive: false }, expected: 200 });
  check('deactivate service', deact?.data?.service?.isActive === false);
  const publicGone = await apiCall(`/api/services/${svcId}`, { expected: 404 });
  check('inactive service hidden from public', publicGone?.status === 404);
  const badStatus = await apiCall(`/api/services/${svcId}/status`, { method: 'PUT', cookie: adminC, body: { isActive: 'yes' }, expected: 400 });
  check('setServiceStatus non-boolean -> 400', true);
  const reactivate = await apiCall(`/api/services/${svcId}/status`, { method: 'PUT', cookie: adminC, body: { isActive: true }, expected: 200 });
  check('reactivate service', reactivate?.data?.service?.isActive === true);
  const publicBack = await apiCall(`/api/services/${svcId}`);
  check('active service visible publicly', publicBack?.status === 200);

  // --- Booking (customer) ---
  const email = `slot${Date.now()}@example.com`;
  const signUp = await apiCall('/api/auth/sign-up/email', {
    method: 'POST',
    body: { name: 'Slot Tester', email, password: 'Password123' },
    expected: 200,
  });
  check('customer sign-up', !!signUp?.cookie);
  const signIn = await apiCall('/api/auth/sign-in/email', {
    method: 'POST',
    body: { email, password: 'Password123' },
    expected: 200,
  });
  const custC = signIn?.cookie;
  check('customer sign-in', !!custC);

  const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const slot = '09:30';
  const apptDate = `${date}T${slot}`;
  const book = await apiCall('/api/appointments', {
    method: 'POST',
    useCookie: custC,
    body: { serviceId: svcId, appointmentDate: apptDate, timeSlot: slot, notes: 'hello' },
    expected: 201,
  });
  check('book appointment', !!book?.data?.appointment, JSON.stringify(book?.data)?.slice(0, 120));
  const apt = book?.data?.appointment;
  check('appointment is pending/unpaid', apt?.status === 'pending' && apt?.paymentStatus === 'unpaid');
  check('appointment stored timeSlot', apt?.timeSlot === slot);
  const aptId = apt?._id;

  // Duplicate booking prevention
  const dup = await apiCall('/api/appointments', {
    method: 'POST',
    useCookie: custC,
    body: { serviceId: svcId, appointmentDate: apptDate, timeSlot: slot },
    expected: 409,
  });
  check('duplicate same date+slot -> 409', dup?.status === 409);

  // Different slot allowed
  const otherSlot = await apiCall('/api/appointments', {
    method: 'POST',
    useCookie: custC,
    body: { serviceId: svcId, appointmentDate: apptDate, timeSlot: '10:00' },
    expected: 201,
  });
  const apt2 = otherSlot?.data?.appointment;
  check('different slot allowed', !!apt2);
  await apiCall(`/api/appointments/${apt2?._id}/cancel`, { method: 'PUT', useCookie: custC, expected: 200 });
  check('customer cancels own pending', true);

  // Unauthenticated booking
  await apiCall('/api/appointments', {
    method: 'POST',
    body: { serviceId: svcId, appointmentDate: apptDate, timeSlot: '10:30' },
    expected: 401,
  });
  check('book unauth -> 401', true);

  // Inactive service booking blocked
  await apiCall(`/api/services/${svcId}/status`, { method: 'PUT', cookie: adminC, body: { isActive: false }, expected: 200 });
  const inactiveBook = await apiCall('/api/appointments', {
    method: 'POST',
    useCookie: custC,
    body: { serviceId: svcId, appointmentDate: apptDate, timeSlot: '11:00' },
    allowed: [404],
  });
  check('book inactive service blocked', inactiveBook?.status === 404);
  await apiCall(`/api/services/${svcId}/status`, { method: 'PUT', cookie: adminC, body: { isActive: true }, expected: 200 });

  // --- Admin sees all appointments ---
  const adminApts = await apiCall('/api/appointments', { cookie: adminC, expected: 200 });
  check('admin sees all appointments', adminApts?.data.appointments.some((a) => a._id === aptId));

  // --- Confirm/cancel ---
  const confirm = await apiCall(`/api/appointments/${aptId}/confirm`, { method: 'PUT', cookie: adminC, expected: 200 });
  check('confirm appointment (admin)', confirm?.data?.appointment?.status === 'confirmed');
  const custConfirmDenied = await apiCall(`/api/appointments/${aptId}/confirm`, { method: 'PUT', useCookie: custC, expected: 403 });
  check('customer confirm -> 403', custConfirmDenied?.status === 403);
  const custCancelConfirmed = await apiCall(`/api/appointments/${aptId}/cancel`, { method: 'PUT', useCookie: custC, expected: 400 });
  check('customer cannot cancel confirmed -> 400', custCancelConfirmed?.status === 400);
  const adminCancel = await apiCall(`/api/appointments/${aptId}/cancel`, { method: 'PUT', cookie: adminC, expected: 200 });
  check('admin cancels confirmed appointment', adminCancel?.data?.appointment?.status === 'cancelled');

  // --- Block / unblock user ---
  const customers = await apiCall('/api/customers', { cookie: adminC, expected: 200 });
  const custDoc = customers?.data?.customers?.find((c) => c.email === email);
  check('admin lists customers', customers?.data?.customers?.length >= 1);
  check('smoke customer listed (role default)', !!custDoc, JSON.stringify(customers?.data?.customers?.map((c) => c.email)));
  if (custDoc) {
    const block = await apiCall(`/api/customers/${custDoc._id}/block`, { method: 'POST', cookie: adminC, expected: 200 });
    check('block user', block?.data?.user?.blocked === true);
    const blockedSess = await apiCall('/api/appointments', { useCookie: custC, allowed: [403] });
    check('blocked user -> 403 on protected', blockedSess?.status === 403);
    const unblock = await apiCall(`/api/customers/${custDoc._id}/unblock`, { method: 'POST', cookie: adminC, expected: 200 });
    check('unblock user', unblock?.data?.user?.blocked === false);
    const okSess = await apiCall('/api/appointments', { useCookie: custC, expected: 200 });
    check('unblocked user can access', okSess?.status === 200);
  }

  // --- Transactions ---
  const payments = await apiCall('/api/payments', { cookie: adminC, expected: 200 });
  check('GET /api/payments (admin)', Array.isArray(payments?.data?.payments) && payments.data.payments.length >= 1);

  console.log('Smoke test done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
