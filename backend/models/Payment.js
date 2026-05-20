import mongoose from 'mongoose';
const paymentSchema = new mongoose.Schema({
  order:             { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  buyer:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:            { type: Number, required: true },
  phone:             { type: String, required: true },
  merchantRequestId: String,
  checkoutRequestId: String,
  mpesaReceiptNumber:String,
  transactionDate:   String,
  status:            { type: String, enum: ['initiated','pending','completed','failed','cancelled'], default: 'initiated' },
  resultCode:        String,
  resultDesc:        String,
  callbackData:      mongoose.Schema.Types.Mixed,
}, { timestamps: true });

paymentSchema.index({ order: 1 });
paymentSchema.index({ checkoutRequestId: 1 });
paymentSchema.index({ status: 1 });

export default mongoose.model('Payment', paymentSchema);
