import User    from '../models/User.js';
import Product from '../models/Product.js';
import Order   from '../models/Order.js';
import Payment from '../models/Payment.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueResult, roleBreakdown, categoryStats, recentOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Order.find().populate('buyer', 'name').populate('product', 'name').sort('-createdAt').limit(10),
    ]);
    res.json({
      success: true, analytics: {
        totalUsers, totalProducts, totalOrders,
        totalRevenue: revenueResult[0]?.total || 0,
        roleBreakdown, categoryStats, recentOrders,
      },
    });
  } catch (err) { next(err); }
};

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }];
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ success: true, total, users });
  } catch (err) { next(err); }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) { next(err); }
};

export const toggleFeatured = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.isFeatured = !product.isFeatured;
    await product.save();
    res.json({ success: true, product });
  } catch (err) { next(err); }
};
