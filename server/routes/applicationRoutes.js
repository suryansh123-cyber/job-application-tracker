const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { 
    applyToJob, 
    getMyApplications, 
    getJobApplications, 
    updateApplicationStatus, 
    submitMockTest,
    getRankedApplications
} = require('../controllers/applicationController');

// Multer Config
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Candidate routes
router.post('/', protect, upload.single('resume'), applyToJob);
router.get('/me', protect, getMyApplications);
router.post('/:id/mock-test', protect, submitMockTest);

// Admin routes
router.get('/job/:jobId', protect, isAdmin, getJobApplications);
router.put('/:id/status', protect, isAdmin, updateApplicationStatus);

// Resume Ranking route (admin only)
router.get('/ranked/:jobId', protect, isAdmin, getRankedApplications);

module.exports = router;
