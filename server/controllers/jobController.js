const Job = require('../models/Job');

exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createJob = async (req, res) => {
    try {
        const jobData = {
            ...req.body,
            userId: req.user._id,
        };
        if (req.file) {
            jobData.resumePath = req.file.path;
        }
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
        if (job.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const updateData = { ...req.body };
        if (req.file) {
            updateData.resumePath = req.file.path;
        }

        job = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ success: true, data: job });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        if (job.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await job.deleteOne();
        res.json({ success: true, message: 'Job removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
