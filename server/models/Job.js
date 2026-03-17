const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true },
    jobRole: { type: String, required: true },
    location: { type: String, enum: ['Remote', 'Onsite', 'Hybrid'], default: 'Remote' },
    status: { type: String, enum: ['Applied', 'Interview', 'Rejected', 'Offer'], default: 'Applied' },
    dateApplied: { type: Date, default: Date.now },
    resumePath: { type: String },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
