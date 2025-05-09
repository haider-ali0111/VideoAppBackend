const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Media = require('../models/Media');
const { body, validationResult } = require('express-validator');

// Add/Update rating for media
router.post('/:mediaId', auth, [
    body('value').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const media = await Media.findById(req.params.mediaId);
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        // Check if user has already rated
        const existingRatingIndex = media.ratings.findIndex(
            rating => rating.user.toString() === req.user._id.toString()
        );

        if (existingRatingIndex !== -1) {
            // Update existing rating
            media.ratings[existingRatingIndex].value = req.body.value;
        } else {
            // Add new rating
            media.ratings.push({
                user: req.user._id,
                value: req.body.value
            });
        }

        await media.save();

        // Calculate new average rating
        const averageRating = media.ratings.reduce((acc, curr) => acc + curr.value, 0) / media.ratings.length;

        res.json({
            message: 'Rating updated successfully',
            averageRating,
            totalRatings: media.ratings.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating rating' });
    }
});

// Get ratings for media
router.get('/:mediaId', auth, async (req, res) => {
    try {
        const media = await Media.findById(req.params.mediaId)
            .populate('ratings.user', 'name');

        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        const averageRating = media.ratings.length > 0
            ? media.ratings.reduce((acc, curr) => acc + curr.value, 0) / media.ratings.length
            : 0;

        res.json({
            ratings: media.ratings,
            averageRating,
            totalRatings: media.ratings.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching ratings' });
    }
});

// Delete rating
router.delete('/:mediaId', auth, async (req, res) => {
    try {
        const media = await Media.findById(req.params.mediaId);
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        // Remove user's rating
        media.ratings = media.ratings.filter(
            rating => rating.user.toString() !== req.user._id.toString()
        );

        await media.save();

        // Calculate new average rating
        const averageRating = media.ratings.length > 0
            ? media.ratings.reduce((acc, curr) => acc + curr.value, 0) / media.ratings.length
            : 0;

        res.json({
            message: 'Rating deleted successfully',
            averageRating,
            totalRatings: media.ratings.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting rating' });
    }
});

module.exports = router; 