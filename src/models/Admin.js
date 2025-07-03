// models/Admin.js
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'Admin',
  },
});

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema);