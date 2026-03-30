import Product from '../models/Product.js';
import logger from '../config/logger.js';

export const getProducts = async (req, res, next) => {
  try {
    const { search, category, county, minPrice, maxPrice, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const query = { isAvailable: true };
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (county) query['location.county'] = new RegExp(county, 'i');
    if (minPrice || maxPrice) {
      query.pricePerUnit = {};
      if (minPrice) query.pricePerUnit.$gte = Number(minPrice);
      if (maxPrice) query.pricePerUnit.$lte = Number(maxPrice);
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).populate('farmer', 'name phone location').sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);
    res.json({ success: true, count: products.length, total, pages: Math.ceil(total / Number(limit)), currentPage: Number(page), products });
  } catch (err) { next(err); }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('farmer', 'name phone location createdAt');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({ ...req.body, farmer: req.user.id });
    logger.info(`Product: ${product.name} by ${req.user.id}`);
    res.status(201).json({ success: true, product });
  } catch (err) { next(err); }
};

export const updateProduct = async (req, res, next) => {
  try {
    let p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Not found' });
    if (p.farmer.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, product: p });
  } catch (err) { next(err); }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Not found' });
    if (p.farmer.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await p.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

export const getMyListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find({ farmer: req.user.id }).sort('-createdAt').skip(skip).limit(Number(limit)),
      Product.countDocuments({ farmer: req.user.id }),
    ]);
    res.json({ success: true, total, products });
  } catch (err) { next(err); }
};
