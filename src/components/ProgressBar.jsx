import React from 'react';
import { Check, X } from 'lucide-react';

const STAGES = [
    { id: 'APPLIED', label: 'Applied' },
    { id: 'RESUME_SELECTED', label: 'Resume Selected' },
    { id: 'MOCK1_PASSED', label: 'Mock 1' },
    { id: 'MOCK2_PASSED', label: 'Mock 2' },
    { id: 'INTERVIEW', label: 'Interview' },
    { id: 'SELECTED', label: 'Selected' }
];

const ProgressBar = ({ status, rejectedAtStage }) => {
    const isRejected = status === 'REJECTED';
    
    let currentIndex = 0;
    let failedIndex = -1;

    if (isRejected) {
        if (rejectedAtStage === 'MOCK1') {
            currentIndex = 2;
            failedIndex = 2;
        } else if (rejectedAtStage === 'MOCK2') {
            currentIndex = 3;
            failedIndex = 3;
        } else if (rejectedAtStage === 'INTERVIEW') {
            currentIndex = 4;
            failedIndex = 4;
        } else {
            // Default rejection at the end or undetermined
            currentIndex = STAGES.length - 1;
            failedIndex = STAGES.length - 1;
        }
    } else {
        currentIndex = STAGES.findIndex(s => s.id === status);
        if (currentIndex === -1) currentIndex = 0;
    }

    return (
        <div className="w-full py-4 relative pb-6">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-slate-100 rounded-full z-0"></div>
                
                {currentIndex > 0 && (
                    <div 
                        className={`absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full z-0 transition-all duration-500 ${isRejected ? 'bg-primary/50' : 'bg-primary/80'}`}
                        style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
                    ></div>
                )}

                {STAGES.map((stage, idx) => {
                    const isFailedHere = isRejected && idx === failedIndex;
                    const isPassed = !isFailedHere && ((!isRejected && idx <= currentIndex) || (isRejected && idx < currentIndex));
                    
                    return (
                        <div key={stage.id} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                                ${isFailedHere ? 'bg-white border-rose-400 text-rose-500 shadow-sm' :
                                  isPassed ? 'bg-primary border-primary text-white shadow-md' :
                                  'bg-white border-slate-200 text-slate-400'}`}>
                                {isFailedHere ? <X size={14} /> : (isPassed ? <Check size={14} /> : <span className="text-xs font-medium">{idx + 1}</span>)}
                            </div>
                            <span className={`absolute -bottom-6 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap
                                ${isFailedHere ? 'text-rose-500 font-bold' : (isPassed ? 'text-primary' : 'text-slate-400')}`}>
                                {isFailedHere ? 'Rejected' : stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressBar;
