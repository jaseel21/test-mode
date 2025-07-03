import mongoose from "mongoose";

const boxSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  houseName: String,
  address: String,
  place: String,
  area: String,
  location: String,
  district: String,
  panchayath: String,
  ward: String,
  mahallu: String,
  pincode: String,
  phone: { type: String, required: true },
  secondaryMobileNumber: String,
  careOf: String,
  lastPayment: Date, // Last payment date
  isActive: { type: Boolean, default: false }, // One-time activation
  registeredDate: { type: Date, default: Date.now },
  sessionUser: { //volunteer derails
    id: String,
    role: String,
    name: String,
    phone: String,
  },
  createdAt: { type: Date, default: Date.now },
  role:{type:String,default:"BoxHolder", required:true},
  updatedAt:{type:Date, default: new Date()},
});

export default mongoose.models.Box || mongoose.model("Box", boxSchema);

// const boxSchema = new mongoose.Schema({
//   serialNumber: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
//   houseName: String,
//   address: String,
//   place: String,
//   area: String,
//   location: String,
//   district: String,
//   panchayath: String,
//   ward: String,
//   role: { type: String, default:"BoxHolder", },
//   mahallu: String,
//   pincode: String,
//   phone: { type: String, required: true },
//   secondaryMobileNumber: String,
//   careOf: String,
//   lastPayment: Date, // Last payment date
//   isActive: { type: Boolean, default: false }, // One-time activation
//   registeredDate: { type: Date, default: Date.now },
//   sessionUser: {
//     id: String,
//     role: String,
//     name: String,
//     phone: String,
//   },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: Date,
// });

// module.exports = mongoose.models.Box || mongoose.model("Box", boxSchema);