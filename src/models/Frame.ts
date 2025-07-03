// src\models\Frame.ts
import mongoose from 'mongoose';

const FrameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a frame name'],
        trim: true,
    },
    imageUrl: {
        type: String,
        required: [true, 'Please provide a frame image URL'],
    },
    dimensions: {
        width: {
            type: Number,
            default: 600,
        },
        height: {
            type: Number,
            default: 600,
        },
    },
    placementCoords: {
        x: {
            type: Number,
            required: [true, 'Please provide x coordinate for image placement'],
        },
        y: {
            type: Number,
            required: [true, 'Please provide y coordinate for image placement'],
        },
        width: {
            type: Number,
            required: [true, 'Please provide width for image placement'],
        },
        height: {
            type: Number,
            required: [true, 'Please provide height for image placement'],
        },
    },
    textSettings: {
        x: {
            type: Number,
            required: [true, 'Please provide x coordinate for text placement'],
        },
        y: {
            type: Number,
            required: [true, 'Please provide y coordinate for text placement'],
        },
        width: {
            type: Number,
            required: [true, 'Please provide width for text area'], 
        },
        height: {
            type: Number,
            required: [true, 'Please provide height for text area'], 
        },
        font: {
            type: String,
            default: 'Roboto',
        },
        size: {
            type: Number,
            default: 16,
        },
        color: {
            type: String,
            default: '#000000',
        },
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

export default mongoose.models.Frame || mongoose.model('Frame', FrameSchema);