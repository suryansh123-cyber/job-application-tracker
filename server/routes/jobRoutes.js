const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getJobs, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) return cb(null, true);
        cb(new Error('Only PDF and DOC/DOCX files are allowed'));
    }
});

router.route('/')
    .get(protect, getJobs)
    .post(protect, upload.single('resume'), createJob);

router.route('/:id')
    .put(protect, upload.single('resume'), updateJob)
    .delete(protect, deleteJob);

module.exports = router;
