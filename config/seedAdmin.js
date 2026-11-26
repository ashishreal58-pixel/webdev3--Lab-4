const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

/**
 * Seed an initial admin account using ADMIN_EMAIL and ADMIN_PASSWORD from .env
 * if it does not already exist.
 */
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const username = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    console.warn('[SEED] ADMIN_EMAIL or ADMIN_PASSWORD not set; skipping admin seed.');
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await userModel.findByEmail(normalizedEmail);

  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await userModel.createUser({
    username,
    email: normalizedEmail,
    passwordHash,
    role: 'admin',
  });

  console.log(`[SEED] Admin account created: ${normalizedEmail}`);
}

module.exports = seedAdmin;
