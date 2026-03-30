import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../config/logger.js';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const respond = (user, code, res) => {
  const token = signToken(user._id);
  const u = user.toObject(); delete u.password;
  res.status(code).json({ success: true, token, user: u });
};

export const register = async (req, res, next) => {
  try {
    const { name, phone, email, password, role, location, hotelDetails } = req.body;
    const existing = await User.findOne({ phone: phone?.replace(/^0/, '+254').replace(/^254/, '+254') });
    if (existing) return res.status(400).json({ success: false, message: 'Phone already registered' });
    const user = await User.create({ name, phone, email, password, role, location, hotelDetails });
    logger.info(`Registered: ${user.phone} (${user.role})`);
    respond(user, 201, res);
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ success: false, message: 'Phone and password required' });
    let normalized = phone;
    if (phone.startsWith('0') && phone.length === 10) normalized = '+254' + phone.slice(1);
    else if ((phone.startsWith('7') || phone.startsWith('1')) && phone.length === 9) normalized = '+254' + phone;
    else if (phone.startsWith('254') && !phone.startsWith('+')) normalized = '+' + phone;
    const user = await User.findOne({ phone: normalized }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });
    user.lastLogin = new Date(); await user.save({ validateBeforeSave: false });
    logger.info(`Login: ${user.phone}`);
    respond(user, 200, res);
  } catch (err) { next(err); }
};

export const getMe = async (req, res, next) => {
  try { const user = await User.findById(req.user.id); res.json({ success: true, user }); }
  catch (err) { next(err); }
};
