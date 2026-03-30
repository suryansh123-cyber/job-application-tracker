/**
 * updateJobs.js
 * 
 * Run once to update the existing 4 job postings to distinct IT roles.
 * Usage: node server/updateJobs.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./models/Job');
const User = require('./models/User');

const IT_JOBS = [
    {
        title: 'Software Development Intern',
        description: 'Join our engineering team as an intern. You will work on building and testing new features, participate in code reviews, and collaborate with senior developers on real-world projects.',
        requiredSkills: ['JavaScript', 'HTML', 'CSS', 'Git', 'React'],
    },
    {
        title: 'Junior Software Engineer (SDE-1)',
        description: 'We are looking for an SDE-1 to design, build and maintain scalable backend services. You will work closely with product and design teams in an agile environment.',
        requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST API', 'JavaScript'],
    },
    {
        title: 'Full Stack Developer',
        description: 'As a Full Stack Developer you will be responsible for developing both client-side and server-side components of our web application, ensuring high performance and responsiveness.',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker'],
    },
    {
        title: 'DevOps & Cloud Engineer',
        description: 'We need a DevOps Engineer to manage CI/CD pipelines, cloud infrastructure, and monitoring. You will work on automating deployments and ensuring high availability of our services.',
        requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'],
    },
];

const updateJobs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find admin user to assign as createdBy
        const admin = await User.findOne({ role: 'Admin' });
        if (!admin) {
            console.error('No admin user found. Run createAdmin.js first.');
            process.exit(1);
        }

        // Get all existing jobs
        const existingJobs = await Job.find().sort({ createdAt: 1 });

        if (existingJobs.length === 0) {
            // No jobs exist — create all 4 fresh
            for (const jobData of IT_JOBS) {
                await Job.create({ ...jobData, createdBy: admin._id });
                console.log(`Created: ${jobData.title}`);
            }
        } else {
            // Update existing jobs with new data (up to 4)
            for (let i = 0; i < Math.min(existingJobs.length, IT_JOBS.length); i++) {
                await Job.findByIdAndUpdate(existingJobs[i]._id, {
                    title: IT_JOBS[i].title,
                    description: IT_JOBS[i].description,
                    requiredSkills: IT_JOBS[i].requiredSkills,
                });
                console.log(`Updated job ${i + 1}: "${existingJobs[i].title}" → "${IT_JOBS[i].title}"`);
            }
            // If there are more than 4 existing jobs, leave them as-is
            if (existingJobs.length > 4) {
                console.log(`${existingJobs.length - 4} additional job(s) left unchanged.`);
            }
            // If there are fewer than 4, create the remaining ones
            for (let i = existingJobs.length; i < IT_JOBS.length; i++) {
                await Job.create({ ...IT_JOBS[i], createdBy: admin._id });
                console.log(`Created new: ${IT_JOBS[i].title}`);
            }
        }

        console.log('\nDone! Job roles updated successfully.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
};

updateJobs();
