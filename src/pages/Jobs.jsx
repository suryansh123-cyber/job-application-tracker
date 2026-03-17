import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import api from '../api/axios';
import JobTable from '../components/JobTable';
import JobForm from '../components/JobForm';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs');
            setJobs(response.data.data || response.data);
        } catch (err) {
            console.error('Error fetching jobs:', err);
        }
    };

    const handleCreateOrUpdate = async (formData) => {
        try {
            if (editingJob) {
                await api.put(`/jobs/${editingJob._id}`, formData);
            } else {
                await api.post('/jobs', formData);
            }
            fetchJobs();
            setIsModalOpen(false);
            setEditingJob(null);
        } catch (err) {
            console.error('Error saving job:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            try {
                await api.delete(`/jobs/${id}`);
                fetchJobs();
            } catch (err) {
                console.error('Error deleting job:', err);
            }
        }
    };

    const openForm = (job = null) => {
        setEditingJob(job);
        setIsModalOpen(true);
    };

    const filteredJobs = jobs.filter(job =>
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobRole.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-1">My Applications</h1>
                    <p className="text-slate-500">Track and manage every job you've applied for.</p>
                </div>
                <button
                    onClick={() => openForm()}
                    className="btn-primary flex items-center justify-center gap-2 py-3 px-8"
                >
                    <Plus size={20} />
                    Add Application
                </button>
            </header>

            <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by company or role..."
                    className="input-field pl-12 py-3 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <JobTable
                jobs={filteredJobs}
                onEdit={openForm}
                onDelete={handleDelete}
            />

            <JobForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateOrUpdate}
                initialData={editingJob}
            />
        </div>
    );
};

export default Jobs;
