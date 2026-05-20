import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, maxlength: 100 },
  phone:    { type: String, required: true, unique: true },
  email:    { type: String, sparse: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['farmer','buyer','admin','hotel'], default: 'buyer' },
  location: {
    county: { type: String, trim: true },
    town:   { type: String, trim: true },
  },
  profileImage: { type: String },
  isActive:     { type: Boolean, default: true },
  lastLogin:    { type: Date },
  hotelDetails: {
    businessName:   String,
    businessType:   { type: String, enum: ['hotel','restaurant','canteen','supermarket','other'] },
    registrationNo: String,
    bulkBudgetKsh:  Number,
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.pre('save', function (next) {
  if (this.isModified('phone')) {
    if (this.phone.startsWith('0') && this.phone.length === 10)
      this.phone = '+254' + this.phone.slice(1);
    else if ((this.phone.startsWith('7') || this.phone.startsWith('1')) && this.phone.length === 9)
      this.phone = '+254' + this.phone;
    else if (this.phone.startsWith('254') && !this.phone.startsWith('+'))
      this.phone = '+' + this.phone;
  }
  next();
});
userSchema.methods.comparePassword = async function (pwd) {
  return bcrypt.compare(pwd, this.password);
};
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);
