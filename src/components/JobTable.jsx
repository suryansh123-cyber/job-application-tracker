import React from 'react';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';

const statusColors = {
    Applied: 'bg-amber-100 text-amber-700',
    Interview: 'bg-purple-100 text-purple-700',
    Rejected: 'bg-rose-100 text-rose-700',
    Offer: 'bg-emerald-100 text-emerald-700',
};

const JobTable = ({ jobs, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Applied</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {jobs.map((job) => (
                            <tr key={job._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-slate-800">{job.companyName}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{job.jobRole}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {new Date(job.dateApplied).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => onEdit(job)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => onDelete(job._id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {jobs.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                                    No applications found. Start by adding one!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JobTable;
