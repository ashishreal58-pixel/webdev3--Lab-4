const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const appEmitter = require('../events/emitter');

function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

/**
 * POST /api/auth/signup
 */
async function signup(req, res) {
  try {
    const { username, name, email, password } = req.body || {};
    const rawUsername = username !== undefined ? username : name;

    if (
      typeof rawUsername !== 'string' ||
      !rawUsername.trim() ||
      typeof email !== 'string' ||
      !email.includes('@') ||
      typeof password !== 'string' ||
      password.length < 6
    ) {
      return res.status(400).json({
        message: 'Invalid input. Provide username, valid email, and password (min 6 chars).',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userModel.findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({
      username: rawUsername.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'user',
    });

    appEmitter.emit('user:signup', { email: user.email, role: user.role });

    return res.status(201).json({
      message: 'User registered',
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }
    console.error('[AUTH] Signup error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    appEmitter.emit('user:login', { email: user.email });

    const token = signToken(user);
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

/**
 * GET /api/profile
 */
async function getProfile(req, res) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[USER] Profile error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

/**
 * GET /api/admin/users (admin only)
 */
async function getAllUsers(req, res) {
  try {
    const users = await userModel.findAllWithoutPassword();
    return res.status(200).json({ count: users.length, users });
  } catch (err) {
    console.error('[ADMIN] Get users error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

module.exports = {
  signup,
  login,
  getProfile,
  getAllUsers,
};
