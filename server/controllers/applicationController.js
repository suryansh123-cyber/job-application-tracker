const Application = require('../models/Application');

const MOCK1_ANSWERS = ['A', 'B', 'C'];
const MOCK2_ANSWERS = ['C', 'A', 'D'];

exports.applyToJob = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'Resume is required' });
        
        const existingApp = await Application.findOne({ user_id: req.user._id, job_id: req.body.jobId });
        if (existingApp) {
            return res.status(400).json({ success: false, message: 'You have already applied to this job' });
        }

        const application = await Application.create({
            user_id: req.user._id,
            job_id: req.body.jobId,
            resume_url: `/uploads/${req.file.filename}`,
            status: 'APPLIED'
        });
        
        res.status(201).json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyApplications = async (req, res) => {
    try {
        const apps = await Application.find({ user_id: req.user._id }).populate('job_id').sort({ createdAt: -1 });
        res.json({ success: true, data: apps });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getJobApplications = async (req, res) => {
    try {
        const apps = await Application.find({ job_id: req.params.jobId }).populate('user_id', 'username email');
        res.json({ success: true, data: apps });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status, interviewDetails } = req.body;
        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

        if (status === 'REJECTED') {
            if (app.status === 'APPLIED') app.rejectedAtStage = 'RESUME';
            else if (app.status === 'INTERVIEW') app.rejectedAtStage = 'INTERVIEW';
        }

        app.status = status;
        if (status === 'INTERVIEW' && interviewDetails) {
            app.interviewDetails = interviewDetails;
        }
        await app.save();

        res.json({ success: true, data: app });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.submitMockTest = async (req, res) => {
    try {
        const { testNumber, answers } = req.body; // e.g. { testNumber: 1, answers: ['A', 'B', 'B'] }
        const app = await Application.findById({ _id: req.params.id, user_id: req.user._id });
        if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

        const expected = testNumber === 1 ? MOCK1_ANSWERS : MOCK2_ANSWERS;
        let correct = 0;
        for (let i = 0; i < expected.length; i++) {
            if (answers[i] === expected[i]) correct++;
        }

        if (correct >= 2) {
            if (testNumber === 1 && app.status === 'RESUME_SELECTED') {
                app.status = 'MOCK1_PASSED';
            } else if (testNumber === 2 && app.status === 'MOCK1_PASSED') {
                app.status = 'MOCK2_PASSED';
            }
            await app.save();
            res.json({ success: true, passed: true, status: app.status });
        } else {
            app.status = 'REJECTED';
            app.rejectedAtStage = testNumber === 1 ? 'MOCK1' : 'MOCK2';
            await app.save();
            res.json({ success: true, passed: false, status: app.status, message: 'You failed the mock test. Better luck next time!' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
