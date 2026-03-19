const Job = require('../models/Job');

exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.json({ success: true, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createJob = async (req, res) => {
    try {
        const jobData = {
            ...req.body,
            createdBy: req.user._id,
        };
        const job = await Job.create(jobData);
        res.status(201).json({ success: true, data: job });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: job });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        await job.deleteOne();
        res.json({ success: true, message: 'Job removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
