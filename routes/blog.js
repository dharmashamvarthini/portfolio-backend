const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { auth, admin } = require('../middleware/auth');

// GET all blogs (Public)
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single blog (Public)
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ 
                success: false, 
                message: 'Blog not found' 
            });
        }
        // Increment views
        blog.views += 1;
        await blog.save();
        res.json(blog);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create blog (Admin only)
router.post('/', auth, admin, async (req, res) => {
    try {
        const blog = new Blog(req.body);
        const savedBlog = await blog.save();
        res.status(201).json({ 
            success: true, 
            data: savedBlog 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// PUT update blog (Admin only)
router.put('/:id', auth, admin, async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!blog) {
            return res.status(404).json({ 
                success: false, 
                message: 'Blog not found' 
            });
        }
        res.json({ success: true, data: blog });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// DELETE blog (Admin only)
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ 
                success: false, 
                message: 'Blog not found' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Blog deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;