import User from '../models/user.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES = '1d';

export const signup = async (req, res) => {
  try {
    const { fullname, username, email, password, role } = req.body;
    if (!fullname || !username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // If creating a superadmin, ensure only one exists
    if (role === 'superadmin') {
      const existingSuper = await User.findOne({ role: 'superadmin' });
      if (existingSuper) return res.status(403).json({ message: 'Superadmin already exists' });
    }

    // If creating institution_admin, require that the requester is a superadmin
    if (role === 'institution_admin') {
      if (!req.user || req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Only superadmin can create institution admin' });
      }
    }

    const user = new User({ fullname, username, email, password, role: role || 'institution_admin' });
    await user.save();
    return res.status(201).json({ message: 'User created', userId: user._id });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(400).json({ message: 'Email already exists' });
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.json({ token, user: { id: user._id, email: user.email, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
