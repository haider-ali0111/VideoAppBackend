const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    caption: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['video', 'image'],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    location: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        value: {
            type: Number,
            min: 1,
            max: 5
        }
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for average rating
mediaSchema.virtual('averageRating').get(function() {
    if (this.ratings.length === 0) return 0;
    const sum = this.ratings.reduce((acc, curr) => acc + curr.value, 0);
    return sum / this.ratings.length;
});

// Ensure virtuals are included in JSON
mediaSchema.set('toJSON', { virtuals: true });
mediaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Media', mediaSchema); 