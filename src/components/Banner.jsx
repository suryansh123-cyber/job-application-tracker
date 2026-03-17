import React from 'react';
import { Info } from 'lucide-react';

const Banner = ({ message }) => {
    if (!message) return null;

    return (
        <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-3 text-primary-dark">
            <Info size={18} />
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
};

export default Banner;
