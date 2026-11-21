const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Service = require('./models/Service');

async function seed() {
  // Bootstrap admin from environment (idempotent)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await User.updateOne(
      { email: adminEmail.toLowerCase(), role: 'admin' },
      { $set: { name: process.env.ADMIN_NAME || 'Admin', email: adminEmail.toLowerCase(), passwordHash: hash, role: 'admin' } },
      { upsert: true }
    );
    console.log('[seed] Admin user ready:', adminEmail);
  }

  // Demo services when the catalog is empty
  if ((await Service.countDocuments()) === 0) {
    await Service.create([
      { name: 'Haircut & Styling', description: "Classic men's and women's haircuts, trims and styling.", category: 'Haircut', price: 8500, durationMinutes: 45 },
      { name: 'Hair Coloring', description: 'From subtle shades to bold statement colors, applied professionally.', category: 'Coloring', price: 12000, durationMinutes: 90 },
      { name: 'Skin & Anti-Aging Facial', description: 'Deep-cleansing, exfoliating, hydrating and anti-aging facial treatment.', category: 'Facial', price: 6500, durationMinutes: 60 },
      { name: 'Bridal Makeup', description: 'Formal bridal makeup with two trials for bride and wedding party.', category: 'Makeup', price: 25000, durationMinutes: 120 },
      { name: 'Nail Art Set', description: 'Custom nail art, gel nails and acrylic extensions.', category: 'Nails', price: 5500, durationMinutes: 60 },
    ]);
    console.log('[seed] Seeded demo services');
  }

  const [userCount, serviceCount] = await Promise.all([User.countDocuments(), Service.countDocuments()]);
  console.log(`[seed] Users: ${userCount}, Services: ${serviceCount}`);
}

module.exports = { seed };
