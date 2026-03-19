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
    interviewDetails: {
        date: { type: Date },
        time: { type: String },
        venue: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
