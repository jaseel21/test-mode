import mongoose from 'mongoose';

const updateDonorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  phone1: { type: String },
  email: { type: String },
  
},{collation:"donors"});

export default mongoose.models.updateDonor || mongoose.model('updateDonor', updateDonorSchema);