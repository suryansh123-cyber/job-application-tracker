const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { scoreResume } = require('../services/resumeScoringService');

const MOCK1_ANSWERS = ['A', 'B', 'C'];
const MOCK2_ANSWERS = ['C', 'A', 'D'];

exports.applyToJob = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'Resume is required' });
        
        const existingApp = await Application.findOne({ user_id: req.user._id, job_id: req.body.jobId });
        if (existingApp) {
            return res.status(400).json({ success: false, message: 'You have already applied to this job' });
        }

        // --- Parse resume text from uploaded PDF ---
        let resumeText = '';
        let scoreData = { score: 0, matchedSkills: [], atsScore: 0, priorityLevel: 'Low' };

        try {
            const pdfBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdfParse(pdfBuffer);
            resumeText = pdfData.text || '';

            // Fetch job to get requiredSkills for scoring
            const job = await Job.findById(req.body.jobId);
            if (job) {
                scoreData = scoreResume(resumeText, job.requiredSkills || []);
            }
        } catch (parseErr) {
            // If PDF parsing fails, we still save the application — just without scoring
            console.warn('PDF parsing failed:', parseErr.message);
        }

        const application = await Application.create({
            user_id: req.user._id,
            job_id: req.body.jobId,
            resume_url: `/uploads/${req.file.filename}`,
            status: 'APPLIED',
            resumeText,
            score:         scoreData.score,
            matchedSkills: scoreData.matchedSkills,
            atsScore:      scoreData.atsScore,
            priorityLevel: scoreData.priorityLevel,
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
        // Populate user details so the frontend always has name/email after status changes
        await app.populate('user_id', 'username email');

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

/**
 * GET /api/applications/ranked/:jobId
 * Returns applications for a job, scored and sorted by score descending.
 * Admin only. Does NOT auto-reject any candidate.
 * For old applications without stored resumeText, the PDF is re-parsed on the fly.
 */
exports.getRankedApplications = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        const apps = await Application.find({ job_id: req.params.jobId })
            .populate('user_id', 'username email')
            .lean();

        const uploadsDir = path.join(__dirname, '../uploads');

        // Score each application — re-parse PDF if resumeText is missing
        const scoringPromises = apps.map(async (app) => {
            let resumeText = app.resumeText || '';

            // If no stored text, try to read from the saved PDF file
            if (!resumeText && app.resume_url) {
                try {
                    const filename = app.resume_url.split(/[\\/]/).pop();
                    const filePath = path.join(uploadsDir, filename);
                    if (fs.existsSync(filePath)) {
                        const buffer = fs.readFileSync(filePath);
                        const parsed = await pdfParse(buffer);
                        resumeText = parsed.text || '';

                        // Persist extracted text back to DB so future calls are instant
                        await Application.findByIdAndUpdate(app._id, { resumeText });
                    }
                } catch (parseErr) {
                    console.warn(`Could not parse PDF for app ${app._id}:`, parseErr.message);
                }
            }

            // Always re-score using the current job's requiredSkills
            const scoreData = scoreResume(resumeText, job.requiredSkills || []);
            return { ...app, resumeText, ...scoreData };
        });

        const scored = await Promise.all(scoringPromises);

        // Sort by score descending (highest first)
        scored.sort((a, b) => (b.score || 0) - (a.score || 0));

        res.json({ success: true, data: scored });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
