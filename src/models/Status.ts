// src/models/Status.ts
import mongoose from 'mongoose';

const StatusSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Please provide status content'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['text', 'image', 'video'],
        default: 'text',
        required: [true, 'Please specify status type'],
    },
    mediaUrl: {
        type: String,
        default: null,
    },
    thumbnailUrl: {
        type: String,
        default: null,
    },
    backgroundColor: {
        type: String,
        default: '#111827', // Dark background default
    },
    textColor: {
        type: String,
        default: '#ffffff', // White text default
    },
    fontFamily: {
        type: String,
        default: 'Inter',
    },
    fontSize: {
        type: Number,
        default: 24,
    },
    tags: {
        type: [String],
        default: [],
    },
    category: {
        type: String,
        required: [true, 'Please specify a category'],
        trim: true,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    usageCount: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

// Create indexes for better performance
StatusSchema.index({ isActive: 1 });
StatusSchema.index({ category: 1 });
StatusSchema.index({ tags: 1 });
StatusSchema.index({ featured: 1 });
StatusSchema.index({ usageCount: -1 }); // Descending index for sorting by popularity

export default mongoose.models.Status || mongoose.model('Status', StatusSchema);