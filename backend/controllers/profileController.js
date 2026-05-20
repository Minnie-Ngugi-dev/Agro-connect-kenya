import User from '../models/User.js';
import logger from '../config/logger.js';

export const getProfile = async (req, res, next) => {
  try { res.json({ success: true, user: await User.findById(req.user.id).select('-password') }); }
  catch (err) { next(err); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, location } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, email, location }, { new: true, runValidators: true, select: '-password' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both passwords required' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Min 6 characters' });
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(currentPassword))) return res.status(401).json({ success: false, message: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    logger.info(`Password changed: ${user.phone}`);
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { next(err); }
};

export const uploadProfileImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ success: false, message: 'imageUrl required' });
    const user = await User.findByIdAndUpdate(req.user.id, { profileImage: imageUrl }, { new: true, select: '-password' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};
