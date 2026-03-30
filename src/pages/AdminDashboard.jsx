import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Users, Briefcase, FileText, CheckCircle, XCircle, Calendar, BarChart2, Eye, EyeOff, Star, Award } from 'lucide-react';

// --- Priority Badge ---
const PRIORITY_CONFIG = {
    Strong:   { bg: 'bg-emerald-100',  text: 'text-emerald-700',  border: 'border-emerald-200',  dot: 'bg-emerald-500' },
    Moderate: { bg: 'bg-yellow-50',    text: 'text-yellow-700',   border: 'border-yellow-200',   dot: 'bg-yellow-400' },
    Weak:     { bg: 'bg-orange-50',    text: 'text-orange-700',   border: 'border-orange-200',   dot: 'bg-orange-400' },
    Low:      { bg: 'bg-red-50',       text: 'text-red-700',      border: 'border-red-200',      dot: 'bg-red-400' },
};

const PriorityBadge = ({ level }) => {
    const cfg = PRIORITY_CONFIG[level] || PRIORITY_CONFIG.Low;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
            {level || 'Low'}
        </span>
    );
};

// --- Ranked Applicant Card ---
const RankedCard = ({ app, onStatusUpdate }) => (
    <div className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
                <h4 className="font-semibold text-slate-800">{app.user_id?.username || 'Unknown'}</h4>
                <p className="text-sm text-slate-500">{app.user_id?.email || 'No email'}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <PriorityBadge level={app.priorityLevel} />
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-slate-200">
                    <Star size={11} className="text-amber-500" /> Score: {app.score ?? 0}/100
                </span>
            </div>
        </div>

        {/* Matched skills */}
        {app.matchedSkills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
                {app.matchedSkills.map(skill => (
                    <span key={skill} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium border border-primary/20">
                        {skill}
                    </span>
                ))}
            </div>
        )}
        {(!app.matchedSkills || app.matchedSkills.length === 0) && (
            <p className="text-xs text-slate-400 italic">No skill matches detected</p>
        )}

        <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
            <span className="bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded text-xs tracking-wide">{app.status}</span>
            <a
                href={`http://localhost:5000/uploads/${app.resume_url?.split(/[\\/]/).pop()}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
                <FileText size={13} /> View Resume
            </a>
            <span className="text-xs text-slate-400 ml-auto">ATS: {app.atsScore?.toFixed(1) ?? 0}/10</span>
        </div>
    </div>
);

// --- Main Component ---
const AdminDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [rankedApplications, setRankedApplications] = useState([]);
    const [showJobForm, setShowJobForm] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', description: '', requiredSkills: '' });
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('all');         // 'all' | 'ranked'
    const [hideLow, setHideLow] = useState(false);
    const [loadingRanked, setLoadingRanked] = useState(false);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs');
            if (res.data.success) setJobs(res.data.data);
        } catch (err) {
            console.error('Error fetching jobs', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async (jobId) => {
        try {
            const res = await api.get(`/applications/job/${jobId}`);
            if (res.data.success) setApplications(res.data.data);
        } catch (err) {
            console.error('Error fetching applications', err);
        }
    };

    const fetchRankedApplications = async (jobId) => {
        setLoadingRanked(true);
        try {
            const res = await api.get(`/applications/ranked/${jobId}`);
            if (res.data.success) setRankedApplications(res.data.data);
        } catch (err) {
            console.error('Error fetching ranked applications', err);
        } finally {
            setLoadingRanked(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    const handleJobClick = (job) => {
        setSelectedJob(job);
        setViewMode('all');
        setHideLow(false);
        fetchApplications(job._id);
    };

    const handleViewModeSwitch = (mode) => {
        setViewMode(mode);
        if (mode === 'ranked' && selectedJob) {
            fetchRankedApplications(selectedJob._id);
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            const skillsArray = newJob.requiredSkills
                ? newJob.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
                : [];
            const payload = { title: newJob.title, description: newJob.description, requiredSkills: skillsArray };
            const res = await api.post('/jobs', payload);
            if (res.data.success) {
                setJobs([res.data.data, ...jobs]);
                setShowJobForm(false);
                setNewJob({ title: '', description: '', requiredSkills: '' });
            }
        } catch (err) {
            console.error('Error creating job', err);
        }
    };

    const updateStatus = async (appId, newStatus, interviewDetails = null) => {
        try {
            const payload = { status: newStatus };
            if (interviewDetails) payload.interviewDetails = interviewDetails;
            const res = await api.put(`/applications/${appId}/status`, payload);
            if (res.data.success) {
                setApplications(applications.map(app => app._id === appId ? res.data.data : app));
            }
        } catch (err) {
            console.error('Error updating status', err);
        }
    };

    const promoteStatus = (app) => {
        if (app.status === 'APPLIED') updateStatus(app._id, 'RESUME_SELECTED');
        else if (app.status === 'MOCK2_PASSED') {
            const date = prompt("Enter Interview Date (YYYY-MM-DD):");
            const time = prompt("Enter Interview Time (HH:MM AM/PM):");
            const venue = prompt("Enter Interview Venue/Link:");
            if (date && time && venue) updateStatus(app._id, 'INTERVIEW', { date, time, venue });
        } else if (app.status === 'INTERVIEW') {
            updateStatus(app._id, 'SELECTED');
        }
    };

    const displayedRanked = hideLow
        ? rankedApplications.filter(a => a.priorityLevel !== 'Low')
        : rankedApplications;

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
            {/* Left Column: Jobs */}
            <div className="md:w-1/3 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        <Briefcase size={24} className="text-primary"/> Job Postings
                    </h2>
                    <button
                        onClick={() => setShowJobForm(!showJobForm)}
                        className="btn-primary p-2 flex items-center gap-1 rounded-lg text-sm"
                    >
                        <Plus size={16} /> New
                    </button>
                </div>

                {showJobForm && (
                    <form onSubmit={handleCreateJob} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
                        <input type="text" placeholder="Job Title" required
                            className="input-field py-2 px-3 text-sm"
                            value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />

                        <textarea placeholder="Job Description" required
                            className="input-field py-2 px-3 text-sm" rows="3"
                            value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} />

                        {/* Required Skills input */}
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">
                                Required Skills <span className="text-slate-400 font-normal">(comma separated, optional)</span>
                            </label>
                            <input type="text" placeholder="e.g. React, Node.js, MongoDB"
                                className="input-field py-2 px-3 text-sm w-full"
                                value={newJob.requiredSkills} onChange={e => setNewJob({...newJob, requiredSkills: e.target.value})} />
                        </div>

                        <button type="submit" className="btn-primary py-2 text-sm rounded-lg">Create Job</button>
                    </form>
                )}

                <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-2">
                    {loading ? <p className="text-slate-500 text-sm">Loading jobs...</p> : jobs.map(job => (
                        <div
                            key={job._id}
                            onClick={() => handleJobClick(job)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedJob?._id === job._id ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                        >
                            <h3 className="font-semibold text-slate-800">{job.title || job.jobRole || 'Unnamed Role'}</h3>
                            <p className="text-xs text-slate-400 mt-2 line-clamp-2">{job.description}</p>
                            {job.requiredSkills?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {job.requiredSkills.slice(0, 3).map(s => (
                                        <span key={s} className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">{s}</span>
                                    ))}
                                    {job.requiredSkills.length > 3 && (
                                        <span className="text-xs text-slate-400">+{job.requiredSkills.length - 3} more</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {!loading && jobs.length === 0 && <p className="text-slate-500 text-sm">No jobs created yet.</p>}
                </div>
            </div>

            {/* Right Column: Applicants */}
            <div className="md:w-2/3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[70vh]">
                {selectedJob ? (
                    <>
                        <div className="mb-5 pb-4 border-b border-slate-100">
                            <div className="flex justify-between items-start gap-4 flex-wrap">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                                        <Users size={24} className="text-primary"/> Applicants
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1">For {selectedJob.title || selectedJob.jobRole || 'Unnamed Role'}</p>
                                </div>
                                <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                                    {viewMode === 'all' ? applications.length : displayedRanked.length} Shown
                                </div>
                            </div>

                            {/* View Toggle */}
                            <div className="mt-4 flex items-center gap-3 flex-wrap">
                                <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm font-medium">
                                    <button
                                        onClick={() => handleViewModeSwitch('all')}
                                        className={`px-4 py-2 flex items-center gap-1.5 transition-colors ${viewMode === 'all' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <Users size={14} /> All Applicants
                                    </button>
                                    <button
                                        onClick={() => handleViewModeSwitch('ranked')}
                                        className={`px-4 py-2 flex items-center gap-1.5 transition-colors ${viewMode === 'ranked' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <BarChart2 size={14} /> Ranked View
                                    </button>
                                </div>

                                {viewMode === 'ranked' && (
                                    <button
                                        onClick={() => setHideLow(!hideLow)}
                                        className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border font-medium transition-colors ${hideLow ? 'bg-rose-50 text-rose-600 border-rose-200' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        {hideLow ? <EyeOff size={13}/> : <Eye size={13}/>}
                                        {hideLow ? 'Showing: Hide Low' : 'Hide Low Priority'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* All Applicants view */}
                        {viewMode === 'all' && (
                            <>
                                {applications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                        <Users size={48} className="mb-4 opacity-50" />
                                        <p>No applicants yet for this job.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {applications.map(app => (
                                            <div key={app._id} className="p-4 border border-slate-200 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 hover:border-slate-300 transition-colors">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-800">{app.user_id?.username || 'Unknown'}</h4>
                                                    <p className="text-sm text-slate-500">{app.user_id?.email || 'No email'}</p>
                                                    
                                                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                                                        <span className="bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded text-xs tracking-wide">
                                                            {app.status}
                                                        </span>
                                                        {app.priorityLevel && <PriorityBadge level={app.priorityLevel} />}
                                                        <a
                                                            href={`http://localhost:5000/uploads/${app.resume_url.split(/[\\/]/).pop()}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                                                        >
                                                            <FileText size={14} /> View Resume
                                                        </a>
                                                    </div>
                                                    {app.status === 'INTERVIEW' && app.interviewDetails && (
                                                        <div className="mt-3 bg-slate-50 p-3 rounded-lg flex items-start gap-2 text-sm text-slate-700 border border-slate-100">
                                                            <Calendar size={16} className="mt-0.5 text-slate-400" />
                                                            <div>
                                                                <p><strong>Date:</strong> {new Date(app.interviewDetails.date).toDateString()} at {app.interviewDetails.time}</p>
                                                                <p><strong>Venue:</strong> {app.interviewDetails.venue}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                                    {(app.status === 'APPLIED' || app.status === 'MOCK2_PASSED' || app.status === 'INTERVIEW') && (
                                                       <button
                                                            onClick={() => promoteStatus(app)}
                                                            className="btn-primary py-1.5 px-4 text-sm rounded flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700"
                                                       >
                                                           <CheckCircle size={16} />
                                                           {app.status === 'APPLIED' ? 'Select Resume' : app.status === 'MOCK2_PASSED' ? 'Schedule Interview' : 'Mark Selected'}
                                                       </button>
                                                    )}
                                                    {app.status !== 'REJECTED' && app.status !== 'SELECTED' && (
                                                        <button
                                                            onClick={() => updateStatus(app._id, 'REJECTED')}
                                                            className="py-1.5 px-4 text-sm rounded flex items-center justify-center gap-1 border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                                                        >
                                                            <XCircle size={16} /> Reject Candidate
                                                        </button>
                                                    )}
                                                    {(app.status === 'MOCK1_PASSED' || app.status === 'RESUME_SELECTED') ? (
                                                        <p className="text-xs text-slate-400 text-center italic">Waiting for candidate...</p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Ranked view */}
                        {viewMode === 'ranked' && (
                            <>
                                {loadingRanked ? (
                                    <div className="flex items-center justify-center h-64 text-slate-400">
                                        <p>Calculating rankings...</p>
                                    </div>
                                ) : displayedRanked.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                        <Award size={48} className="mb-4 opacity-50" />
                                        <p>{hideLow ? 'No candidates above Low priority.' : 'No applicants to rank yet.'}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {displayedRanked.map((app, index) => (
                                            <div key={app._id} className="flex gap-3 items-start">
                                                <div className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold mt-1
                                                    ${index === 0 ? 'bg-amber-400 text-amber-900' : index === 1 ? 'bg-slate-300 text-slate-700' : index === 2 ? 'bg-orange-300 text-orange-800' : 'bg-slate-100 text-slate-500'}`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <RankedCard app={app} onStatusUpdate={updateStatus} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col flex-1 items-center justify-center h-full text-slate-400 py-20">
                        <Briefcase size={64} className="mb-4 opacity-20" />
                        <h3 className="text-xl font-medium text-slate-600 mb-2">Select a Job Posting</h3>
                        <p>Click on any job from the left panel to review its applicants.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
