import Order   from '../models/Order.js';
import Product from '../models/Product.js';
import User    from '../models/User.js';
import logger  from '../config/logger.js';

export const updateHotelProfile = async (req, res, next) => {
  try {
    const { businessName, businessType, registrationNo, bulkBudgetKsh } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { hotelDetails: { businessName, businessType, registrationNo, bulkBudgetKsh } },
      { new: true, select: '-password' }
    );
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

export const placeBulkOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, notes, deliveryFrequency } = req.body;
    if (!items?.length) return res.status(400).json({ success: false, message: 'Items required' });

    const enriched = [];
    for (const { productId, quantity } of items) {
      const product = await Product.findById(productId);
      if (!product || !product.isAvailable) return res.status(400).json({ success: false, message: `Not available: ${productId}` });
      if (product.quantity < quantity) return res.status(400).json({ success: false, message: `Insufficient: ${product.name}` });
      const discountedPrice = Math.round(product.pricePerUnit * 0.95); // 5% hotel discount
      enriched.push({ product, quantity, discountedPrice });
    }

    const byFarmer = {};
    for (const item of enriched) {
      const fid = item.product.farmer.toString();
      if (!byFarmer[fid]) byFarmer[fid] = [];
      byFarmer[fid].push(item);
    }

    const orders = [];
    let grandTotal = 0;
    for (const [farmerId, farmerItems] of Object.entries(byFarmer)) {
      const orderTotal = farmerItems.reduce((s, i) => s + i.discountedPrice * i.quantity, 0);
      grandTotal += orderTotal;
      const order = await Order.create({
        buyer: req.user.id, product: farmerItems[0].product._id, farmer: farmerId,
        quantity: farmerItems[0].quantity, unitPrice: farmerItems[0].discountedPrice, totalPrice: orderTotal,
        deliveryAddress, isCartOrder: true,
        notes: `${notes || ''} | Hotel bulk | ${deliveryFrequency || 'once'}`.trim(),
        cartItems: farmerItems.map(i => ({
          product: i.product._id, name: i.product.name, quantity: i.quantity,
          unitPrice: i.discountedPrice, subtotal: i.discountedPrice * i.quantity,
        })),
      });
      for (const item of farmerItems)
        await Product.findByIdAndUpdate(item.product._id, { $inc: { quantity: -item.quantity } });
      orders.push(order);
    }

    logger.info(`Hotel bulk order: ${enriched.length} items, total KSh ${grandTotal}`);
    res.status(201).json({ success: true, orders, grandTotal, message: `Bulk order placed — 5% discount applied` });
  } catch (err) { next(err); }
};

export const getHotelOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find({ buyer: req.user.id })
        .populate('product', 'name category unit')
        .populate('farmer', 'name phone location')
        .sort('-createdAt').skip(skip).limit(Number(limit)),
      Order.countDocuments({ buyer: req.user.id }),
    ]);
    res.json({ success: true, total, pages: Math.ceil(total / Number(limit)), orders });
  } catch (err) { next(err); }
};

export const getAllHotels = async (req, res, next) => {
  try {
    const hotels = await User.find({ role: 'hotel' }).select('-password').sort('-createdAt');
    res.json({ success: true, hotels });
  } catch (err) { next(err); }
};
