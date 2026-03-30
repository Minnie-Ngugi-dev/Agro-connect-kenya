import Order   from '../models/Order.js';
import Product from '../models/Product.js';
import Cart    from '../models/Cart.js';
import logger  from '../config/logger.js';

// Single product order
export const createOrder = async (req, res, next) => {
  try {
    const { productId, quantity, deliveryAddress, notes } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (!product.isAvailable || product.quantity < quantity)
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    const order = await Order.create({
      buyer: req.user.id, product: productId, farmer: product.farmer,
      quantity, unitPrice: product.pricePerUnit, totalPrice: product.pricePerUnit * quantity,
      deliveryAddress, notes,
    });
    await Product.findByIdAndUpdate(productId, { $inc: { quantity: -quantity } });
    await order.populate(['buyer', 'product', 'farmer']);
    logger.info(`Order: ${order._id}`);
    res.status(201).json({ success: true, order });
  } catch (err) { next(err); }
};

// Cart-based order (multiple products)
export const createCartOrder = async (req, res, next) => {
  try {
    const { cartItems, deliveryAddress, notes } = req.body;
    if (!cartItems?.length) return res.status(400).json({ success: false, message: 'Cart is empty' });

    const enriched = [];
    for (const { productId, quantity } of cartItems) {
      const product = await Product.findById(productId);
      if (!product || !product.isAvailable) return res.status(400).json({ success: false, message: `Not available: ${productId}` });
      if (product.quantity < quantity) return res.status(400).json({ success: false, message: `Insufficient stock: ${product.name}` });
      enriched.push({ product, quantity });
    }

    // Group by farmer
    const byFarmer = {};
    for (const { product, quantity } of enriched) {
      const fid = product.farmer.toString();
      if (!byFarmer[fid]) byFarmer[fid] = [];
      byFarmer[fid].push({ product, quantity });
    }

    const orders = [];
    for (const [farmerId, items] of Object.entries(byFarmer)) {
      const totalPrice = items.reduce((s, { product, quantity }) => s + product.pricePerUnit * quantity, 0);
      const order = await Order.create({
        buyer: req.user.id, product: items[0].product._id, farmer: farmerId,
        quantity: items[0].quantity, unitPrice: items[0].product.pricePerUnit, totalPrice,
        deliveryAddress, notes, isCartOrder: true,
        cartItems: items.map(({ product, quantity }) => ({
          product: product._id, name: product.name, quantity,
          unitPrice: product.pricePerUnit, subtotal: product.pricePerUnit * quantity,
        })),
      });
      for (const { product, quantity } of items)
        await Product.findByIdAndUpdate(product._id, { $inc: { quantity: -quantity } });
      orders.push(order);
    }

    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
    res.status(201).json({ success: true, orders, message: `${orders.length} order(s) placed` });
  } catch (err) { next(err); }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus, sort = '-createdAt' } = req.query;
    const query = { buyer: req.user.id };
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).populate('product', 'name category pricePerUnit unit images').populate('farmer', 'name phone').sort(sort).skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, total, pages: Math.ceil(total / Number(limit)), orders });
  } catch (err) { next(err); }
};

export const getFarmerOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus, sort = '-createdAt' } = req.query;
    const query = { farmer: req.user.id };
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).populate('product', 'name category unit').populate('buyer', 'name phone location').sort(sort).skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, total, pages: Math.ceil(total / Number(limit)), orders });
  } catch (err) { next(err); }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('product').populate('buyer', 'name phone email').populate('farmer', 'name phone');
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });
    const allowed = order.buyer._id.toString() === req.user.id || order.farmer._id.toString() === req.user.id || req.user.role === 'admin';
    if (!allowed) return res.status(403).json({ success: false, message: 'Not authorized' });
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, cancelReason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });
    if (order.farmer.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    order.status = status;
    if (status === 'cancelled' && cancelReason) order.cancelReason = cancelReason;
    await order.save();
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus } = req.query;
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).populate('product', 'name category').populate('buyer', 'name phone').populate('farmer', 'name phone').sort('-createdAt').skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, total, pages: Math.ceil(total / Number(limit)), orders });
  } catch (err) { next(err); }
};
