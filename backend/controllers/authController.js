const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, employeeCode: user.employeeCode },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { employeeCode, email, password, fullName, role } = req.body;

    if (!employeeCode || !email || !password || !fullName) {
      return res.status(400).json({ message: 'employeeCode, email, password and fullName are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { employeeCode }] });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email or employee ID already exists' });
    }

    // Only allow 'admin' role if explicitly requested AND no admin exists yet OR caller is a seed script.
    // For a self-serve signup we default new accounts to 'employee' unless requested and it's the very first user.
    const userCount = await User.countDocuments();
    const assignedRole = userCount === 0 ? 'admin' : role === 'admin' ? 'employee' : 'employee';
    // Note: to keep RBAC honest, new signups can never grant themselves admin except the first bootstrap account.

    const user = new User({ employeeCode, email: email.toLowerCase(), role: assignedRole });
    await user.setPassword(password);
    await user.save();

    const employee = new Employee({ user: user._id, fullName });
    await employee.save();

    const token = signToken(user);
    return res.status(201).json({ token, user: user.toSafeJSON(), employee });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
}

// GET /api/auth/me
async function me(req, res) {
  const user = await User.findById(req.user.id);
  const employee = await Employee.findOne({ user: req.user.id });
  return res.json({ user: user.toSafeJSON(), employee });
}

module.exports = { register, login, me };
