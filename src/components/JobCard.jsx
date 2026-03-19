import React from 'react';
import { Briefcase, MapPin, Building2, Calendar, ChevronRight } from 'lucide-react';

const JobCard = ({ job, onApply }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                        <Building2 size={24} className="text-slate-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 tracking-tight">{job.title || job.jobRole || 'Unnamed Role'}</h3>

                    </div>
                </div>
                <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-100 tracking-wide uppercase">
                    Active
                </span>
            </div>

            <div className="mt-2 mb-6">
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                    {job.description}
                </p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                    <Calendar size={14} />
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <button 
                    onClick={() => onApply(job)}
                    className="btn-primary py-2 px-5 text-sm rounded-xl flex items-center gap-1 group"
                >
                    Apply Now
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default JobCard;
