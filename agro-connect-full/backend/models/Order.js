import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:      String,
  quantity:  Number,
  unitPrice: Number,
  subtotal:  Number,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  buyer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  farmer:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity:    { type: Number, required: true, min: 1 },
  unitPrice:   { type: Number, required: true },
  totalPrice:  { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending','confirmed','processing','shipped','delivered','cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid','pending','paid','failed','refunded'],
    default: 'unpaid',
  },
  paidAt:        Date,
  mpesaReceipt:  String,
  deliveryAddress: { county: String, town: String, details: String },
  notes:         { type: String, maxlength: 500 },
  cancelReason:  String,
  isCartOrder:   { type: Boolean, default: false },
  cartItems:     [cartItemSchema],
}, { timestamps: true });

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ farmer: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ status: 1 });

export default mongoose.model('Order', orderSchema);
