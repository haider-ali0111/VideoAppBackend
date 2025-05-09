const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Media = require('../models/Media');
const { body, validationResult } = require('express-validator');

// Add comment to media
router.post('/:mediaId', auth, [
    body('text').trim().notEmpty().withMessage('Comment text is required')
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

        const comment = {
            user: req.user._id,
            text: req.body.text
        };

        media.comments.push(comment);
        await media.save();

        // Populate user info for the new comment
        await media.populate('comments.user', 'name');

        res.status(201).json(media.comments[media.comments.length - 1]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding comment' });
    }
});

// Get comments for media
router.get('/:mediaId', auth, async (req, res) => {
    try {
        const media = await Media.findById(req.params.mediaId)
            .populate('comments.user', 'name');

        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        res.json(media.comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

// Delete comment
router.delete('/:mediaId/:commentId', auth, async (req, res) => {
    try {
        const media = await Media.findById(req.params.mediaId);
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        const comment = media.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user is the comment author
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        comment.remove();
        await media.save();

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting comment' });
    }
});

module.exports = router; 