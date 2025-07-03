// src/models/StatusCategory.ts
import mongoose from 'mongoose';

const StatusCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

export default mongoose.models.StatusCategory || mongoose.model('StatusCategory', StatusCategorySchema);