import React, { useState, useEffect } from 'react';
import { Search, Upload, X, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import JobCard from '../components/JobCard';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Application modal state
    const [selectedJob, setSelectedJob] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [applying, setApplying] = useState(false);
    const [applyError, setApplyError] = useState('');
    const [applySuccess, setApplySuccess] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs');
            setJobs(response.data.data || []);
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyClick = (job) => {
        setSelectedJob(job);
        setResumeFile(null);
        setApplyError('');
        setApplySuccess('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type !== 'application/pdf') {
            setApplyError('Only PDF files are allowed');
            setResumeFile(null);
        } else {
            setApplyError('');
            setResumeFile(file);
        }
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        if (!resumeFile) {
            setApplyError('Please upload your resume');
            return;
        }

        setApplying(true);
        setApplyError('');
        
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('jobId', selectedJob._id);

        try {
            const res = await api.post('/applications', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setApplySuccess('Successfully applied for ' + selectedJob.title);
                setTimeout(() => {
                    setSelectedJob(null);
                }, 2000);
            }
        } catch (err) {
            setApplyError(err.response?.data?.message || 'Error applying to job');
        } finally {
            setApplying(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const jobTitle = job.title || job.jobRole || '';
        return jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-1">Available Jobs</h1>
                    <p className="text-slate-500">Discover and apply to new opportunities.</p>
                </div>
            </header>

            <div className="mb-8 relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by role..."
                    className="input-field pl-12 py-3 bg-white w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-slate-500">Loading jobs...</div>
            ) : filteredJobs.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
                    No jobs match your search criteria.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map(job => (
                        <JobCard key={job._id} job={job} onApply={handleApplyClick} />
                    ))}
                </div>
            )}

            {/* Application Modal */}
            {selectedJob && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setSelectedJob(null)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <h2 className="text-xl font-bold text-slate-800 mb-1">Apply for Role</h2>
                        <p className="text-slate-500 text-sm mb-6">
                            For <span className="font-semibold text-slate-700">{selectedJob.title}</span>
                        </p>

                        {!applySuccess ? (
                            <form onSubmit={submitApplication} className="space-y-4">
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 hover:bg-slate-50 hover:border-primary/50 transition-colors text-center cursor-pointer relative">
                                    <input 
                                        type="file" 
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Upload size={32} className="mx-auto text-primary mb-3" />
                                    <h3 className="font-medium text-slate-700 mb-1">
                                        {resumeFile ? resumeFile.name : 'Upload your Resume'}
                                    </h3>
                                    <p className="text-xs text-slate-400">PDFs up to 5MB</p>
                                </div>

                                {applyError && <p className="text-sm text-rose-500 text-center">{applyError}</p>}

                                <button 
                                    type="submit" 
                                    disabled={applying || !resumeFile}
                                    className="w-full btn-primary py-3 rounded-xl disabled:opacity-50"
                                >
                                    {applying ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Application Sent!</h3>
                                <p className="text-slate-500">Good luck on your application.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jobs;
