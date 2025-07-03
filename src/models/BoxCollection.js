import mongoose from "mongoose";
const boxCollectionSchema = new mongoose.Schema({
  boxId: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BoxCollection', boxCollectionSchema);