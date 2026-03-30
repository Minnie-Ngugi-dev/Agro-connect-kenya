import Cart    from '../models/Cart.js';
import Product from '../models/Product.js';

const populateCart = (cart) => cart.populate({
  path: 'items.product',
  select: 'name category pricePerUnit unit images isAvailable quantity location farmer',
  populate: { path: 'farmer', select: 'name' },
});

const getOrCreate = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreate(req.user.id);
    await populateCart(cart);
    const total = cart.items.reduce((s, i) => s + (i.product?.pricePerUnit || 0) * i.quantity, 0);
    res.json({ success: true, cart, total, itemCount: cart.items.reduce((s, i) => s + i.quantity, 0) });
  } catch (err) { next(err); }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId required' });
    const product = await Product.findById(productId);
    if (!product || !product.isAvailable) return res.status(404).json({ success: false, message: 'Product not available' });
    if (product.quantity < quantity) return res.status(400).json({ success: false, message: `Only ${product.quantity} ${product.unit} available` });

    const cart = await getOrCreate(req.user.id);
    const existing = cart.items.find(i => i.product.toString() === productId);
    if (existing) existing.quantity = quantity;
    else cart.items.push({ product: productId, quantity });
    await cart.save();
    await populateCart(cart);
    const total = cart.items.reduce((s, i) => s + (i.product?.pricePerUnit || 0) * i.quantity, 0);
    res.json({ success: true, cart, total, itemCount: cart.items.reduce((s, i) => s + i.quantity, 0) });
  } catch (err) { next(err); }
};

export const bulkAddToCart = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ success: false, message: 'items array required' });
    for (const { productId, quantity } of items) {
      const p = await Product.findById(productId);
      if (!p || !p.isAvailable) return res.status(400).json({ success: false, message: `Not available: ${productId}` });
      if (p.quantity < quantity) return res.status(400).json({ success: false, message: `Insufficient: ${p.name}` });
    }
    const cart = await getOrCreate(req.user.id);
    for (const { productId, quantity } of items) {
      const existing = cart.items.find(i => i.product.toString() === productId);
      if (existing) existing.quantity = quantity;
      else cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    await populateCart(cart);
    const total = cart.items.reduce((s, i) => s + (i.product?.pricePerUnit || 0) * i.quantity, 0);
    res.json({ success: true, cart, total, itemCount: cart.items.reduce((s, i) => s + i.quantity, 0) });
  } catch (err) { next(err); }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { items: { product: req.params.productId } } },
      { new: true }
    );
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    await populateCart(cart);
    const total = cart.items.reduce((s, i) => s + (i.product?.pricePerUnit || 0) * i.quantity, 0);
    res.json({ success: true, cart, total, itemCount: cart.items.reduce((s, i) => s + i.quantity, 0) });
  } catch (err) { next(err); }
};

export const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) { next(err); }
};
