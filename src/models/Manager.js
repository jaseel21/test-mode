// models/Admin.js
import mongoose from 'mongoose';

const managerSchema = new mongoose.Schema({
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
    default: 'Manager',
  },
});

export default mongoose.models.Manager || mongoose.model('Manager', managerSchema);