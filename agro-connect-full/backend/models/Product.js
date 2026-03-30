import mongoose from 'mongoose';
export const CATEGORIES = ['Fruits','Vegetables','Cereals','Legumes','Tubers','Dairy','Poultry','Other'];
export const UNITS = ['kg','g','tonnes','bags','crates','pieces','litres','bunches'];

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, maxlength: 100 },
  category:    { type: String, required: true, enum: CATEGORIES },
  description: { type: String, maxlength: 500 },
  quantity:    { type: Number, required: true, min: 0 },
  unit:        { type: String, required: true, enum: UNITS },
  pricePerUnit:{ type: Number, required: true, min: 0 },
  images:      [{ type: String }],
  location:    { county: { type: String, required: true }, town: String },
  farmer:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags:        [{ type: String, lowercase: true }],
  harvestDate: Date,
  expiryDate:  Date,
  isAvailable: { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
  views:       { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ name: 'text', tags: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ 'location.county': 1 });
productSchema.index({ farmer: 1 });
productSchema.index({ isAvailable: 1 });

export default mongoose.model('Product', productSchema);
