const { scoreResume } = require('./services/resumeScoringService');

const sampleResume = `
John Doe - Software Developer
Summary
Experienced software developer with 3 years of experience building web applications.

Skills
React, JavaScript, Node.js, MongoDB, HTML, CSS, Git

Experience
Software Engineer at ABC Corp 2021-2024
Built REST APIs with Node.js and Express
Developed React frontend components
Used MongoDB for data storage and retrieval

Education
B.Tech in Computer Science XYZ University 2021

Projects
Job Tracker App A MERN stack application for tracking job applications

Certifications
AWS Certified Cloud Practitioner
`;

const skills1 = ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Git'];
const skills2 = ['AWS', 'Docker', 'Kubernetes', 'Terraform'];

console.log('--- Test 1: Matching skills (expect Strong/Moderate) ---');
const r1 = scoreResume(sampleResume, skills1);
console.log(r1);

console.log('\n--- Test 2: Non-matching skills (expect Low/Weak) ---');
const r2 = scoreResume(sampleResume, skills2);
console.log(r2);

console.log('\n--- Test 3: No required skills (ATS only, expect Moderate+) ---');
const r3 = scoreResume(sampleResume, []);
console.log(r3);

console.log('\n--- Test 4: Empty text (expect Low, score 0) ---');
const r4 = scoreResume('', skills1);
console.log(r4);
