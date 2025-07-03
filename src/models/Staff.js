// models/Admin.js
import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
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
    default: 'Staff',
  },
});

export default mongoose.models.Staff || mongoose.model('Staff', staffSchema);