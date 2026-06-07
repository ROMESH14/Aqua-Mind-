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

  const existing = await userModel.findByEmail(email);
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const existingUser = await userModel.findByUsername(username);
  if (existingUser) return res.status(409).json({ message: 'Username already taken' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userModel.create({ username, email, passwordHash });
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

  const valid = await bcrypt.compare(password, user.PasswordHash);
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

module.exports = { register, login, me };
