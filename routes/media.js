const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, checkRole } = require('../middleware/auth');
const Media = require('../models/Media');
const { uploadToAzure, deleteFromAzure } = require('../config/azureStorage');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only videos and images are allowed.'));
        }
    }
});

// Upload media (creator only)
router.post('/upload', auth, checkRole(['creator']), upload.single('media'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, caption, location, tags } = req.body;
        const fileType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
        const fileName = `${Date.now()}-${req.file.originalname}`;

        // Upload to Azure
        const url = await uploadToAzure(req.file, fileName);

        // Create media document
        const media = new Media({
            title,
            caption,
            type: fileType,
            url,
            location,
            tags: tags ? JSON.parse(tags) : [],
            creator: req.user._id
        });

        await media.save();
        res.status(201).json(media);
    } catch (error) {
        console.error('Error uploading media:', error);
        res.status(500).json({ message: error.message || 'Error uploading media' });
    }
});

// Get all media (with pagination)
router.get('/', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const media = await Media.find()
            .populate('creator', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Media.countDocuments();

        res.json({
            media,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalMedia: total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching media' });
    }
});

// Get media by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const media = await Media.findById(req.params.id)
            .populate('creator', 'name email')
            .populate('comments.user', 'name')
            .populate('ratings.user', 'name');

        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        res.json(media);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching media' });
    }
});

// Search media
router.get('/search', auth, async (req, res) => {
    try {
        const { query, type, location } = req.query;
        const searchQuery = {};

        if (query) {
            searchQuery.$or = [
                { title: { $regex: query, $options: 'i' } },
                { caption: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } }
            ];
        }

        if (type) {
            searchQuery.type = type;
        }

        if (location) {
            searchQuery.location = { $regex: location, $options: 'i' };
        }

        const media = await Media.find(searchQuery)
            .populate('creator', 'name email')
            .sort({ createdAt: -1 });

        res.json(media);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error searching media' });
    }
});

// Delete media (creator only)
router.delete('/:id', auth, checkRole(['creator']), async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        // Check if user is the creator
        if (media.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this media' });
        }

        // Delete from Azure
        const fileName = media.url.split('/').pop();
        await deleteFromAzure(fileName);

        // Delete from database
        await media.remove();

        res.json({ message: 'Media deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting media' });
    }
});

module.exports = router; 