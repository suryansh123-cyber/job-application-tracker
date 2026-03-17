import React from 'react';
import { Layout, Briefcase, Clock, XCircle, Trophy } from 'lucide-react';

const icons = {
    total: Layout,
    applied: Briefcase,
    interview: Clock,
    rejected: XCircle,
    offer: Trophy,
};

const colors = {
    total: 'text-blue-500 bg-blue-50',
    applied: 'text-amber-500 bg-amber-50',
    interview: 'text-purple-500 bg-purple-50',
    rejected: 'text-rose-500 bg-rose-50',
    offer: 'text-emerald-500 bg-emerald-50',
};

const StatCard = ({ title, value, type }) => {
    const Icon = icons[type];
    const colorClass = colors[type];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;
