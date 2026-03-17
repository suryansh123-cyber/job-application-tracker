import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

const JobForm = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        jobRole: '',
        location: 'Remote',
        status: 'Applied',
        dateApplied: new Date().toISOString().split('T')[0],
        notes: '',
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                dateApplied: new Date(initialData.dateApplied).toISOString().split('T')[0],
            });
        } else {
            setFormData({
                companyName: '',
                jobRole: '',
                location: 'Remote',
                status: 'Applied',
                dateApplied: new Date().toISOString().split('T')[0],
                notes: '',
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (file) data.append('resume', file);
        onSubmit(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Application' : 'Add Application'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 col-span-2">
                            <label className="text-sm font-medium text-slate-700">Company Name</label>
                            <input
                                type="text" name="companyName" required
                                value={formData.companyName} onChange={handleChange}
                                className="input-field" placeholder="Google, Meta, etc."
                            />
                        </div>
                        <div className="space-y-1 col-span-2">
                            <label className="text-sm font-medium text-slate-700">Job Role</label>
                            <input
                                type="text" name="jobRole" required
                                value={formData.jobRole} onChange={handleChange}
                                className="input-field" placeholder="Software Engineer"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Location</label>
                            <select name="location" value={formData.location} onChange={handleChange} className="input-field">
                                <option>Remote</option>
                                <option>Onsite</option>
                                <option>Hybrid</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                                <option>Applied</option>
                                <option>Interview</option>
                                <option>Rejected</option>
                                <option>Offer</option>
                            </select>
                        </div>
                        <div className="space-y-1 col-span-2">
                            <label className="text-sm font-medium text-slate-700">Date Applied</label>
                            <input
                                type="date" name="dateApplied" required
                                value={formData.dateApplied} onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                        <div className="space-y-1 col-span-2">
                            <label className="text-sm font-medium text-slate-700">Resume (Upload PDF)</label>
                            <div className="relative">
                                <input
                                    type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="input-field flex items-center gap-2 text-slate-500 bg-slate-50 border-dashed border-2">
                                    <Upload size={18} />
                                    <span>{file ? file.name : 'Choose a file...'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" className="btn-primary flex-1">{initialData ? 'Update' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JobForm;
