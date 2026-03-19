const express = require('express');
const router = express.Router();
const { getJobs, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getJobs)
    .post(protect, isAdmin, createJob);

router.route('/:id')
    .put(protect, isAdmin, updateJob)
    .delete(protect, isAdmin, deleteJob);

module.exports = router;
