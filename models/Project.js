const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    technologies: {
        type: [String],
        required: true
    },
    image: {
        type: String,
        default: 'default-project.jpg'
    },
    liveLink: {
        type: String,
        default: ''
    },
    githubLink: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['web', 'mobile', 'ai', 'design', 'other'],
        default: 'web'
    },
    featured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', projectSchema);