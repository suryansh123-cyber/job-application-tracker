const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    resume_url: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['APPLIED', 'RESUME_SELECTED', 'MOCK1_PASSED', 'MOCK2_PASSED', 'INTERVIEW', 'SELECTED', 'REJECTED'], 
        default: 'APPLIED' 
    },
    rejectedAtStage: { type: String },

    // Resume Screening Fields
    resumeText:    { type: String },
    score:         { type: Number, default: 0 },
    matchedSkills: { type: [String], default: [] },
    atsScore:      { type: Number, default: 0 },
    priorityLevel: { type: String, enum: ['Strong', 'Moderate', 'Weak', 'Low'], default: 'Low' },
    interviewDetails: {
        date: { type: Date },
        time: { type: String },
        venue: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
