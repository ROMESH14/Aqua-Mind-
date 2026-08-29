const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

function signToken(user) {
  return jwt.sign(
    { id: user.UserID, email: user.Email, username: user.Username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await userModel.findByEmail(normalizedEmail);
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const existingUser = await userModel.findByUsername(username);
  if (existingUser) return res.status(409).json({ message: 'Username already taken' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userModel.create({ username, email: normalizedEmail, passwordHash });
  const token = signToken(user);

  res.status(201).json({
    token,
    user: { id: user.UserID, username: user.Username, email: user.Email },
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await userModel.findByEmail(email);
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  if (!user.PasswordHash) {
    return res.status(500).json({ message: 'Account has no password set. Please register again or reset in phpMyAdmin.' });
  }

  let valid = false;
  try {
    valid = await bcrypt.compare(password, user.PasswordHash);
  } catch {
    return res.status(500).json({ message: 'Could not verify password. Please register a new account.' });
  }
  if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.UserID, username: user.Username, email: user.Email },
  });
}

async function me(req, res) {
  const user = await userModel.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.UserID, username: user.Username, email: user.Email });
}

function publicUser(user) {
  return { id: user.UserID, username: user.Username, email: user.Email };
}

async function updateProfile(req, res) {
  const username = String(req.body.username || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!username || !email) {
    return res.status(400).json({ message: 'Username and email are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Enter a valid email address' });
  }

  const existingEmail = await userModel.findByEmail(email);
  if (existingEmail && existingEmail.UserID !== req.user.id) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  const existingUser = await userModel.findByUsername(username);
  if (existingUser && existingUser.UserID !== req.user.id) {
    return res.status(409).json({ message: 'Username already taken' });
  }

  const user = await userModel.updateProfile(req.user.id, { username, email });
  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  const user = await userModel.findAuthById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  let valid = false;
  try {
    valid = await bcrypt.compare(currentPassword, user.PasswordHash);
  } catch {
    return res.status(500).json({ message: 'Could not verify password' });
  }
  if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

  const passwordHash = await bcrypt.hash(String(newPassword), 10);
  await userModel.updatePassword(req.user.id, passwordHash);
  res.json({ message: 'Password updated' });
}

module.exports = { register, login, me, updateProfile, changePassword };
