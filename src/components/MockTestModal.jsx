import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const mock1Questions = [
    { q: "What is React?", options: { A: "A Library", B: "A Framework", C: "A Database", D: "An OS" }, correct: 'A' },
    { q: "Which hook manages state?", options: { A: "useEffect", B: "useState", C: "useContext", D: "useRef" }, correct: 'B' },
    { q: "What does DOM stand for?", options: { A: "Data Object Model", B: "Document Object Module", C: "Document Object Model", D: "Data Orientation Model" }, correct: 'C' }
];

const mock2Questions = [
    { q: "Node.js is primarily used for?", options: { A: "UI", B: "Styling", C: "Backend", D: "Gaming" }, correct: 'C' },
    { q: "What is Express.js?", options: { A: "Web Framework", B: "Database", C: "Browser", D: "Compiler" }, correct: 'A' },
    { q: "Which of the following is an HTTP method?", options: { A: "FETCH", B: "PULL", C: "UPDATE", D: "POST" }, correct: 'D' }
];

const MockTestModal = ({ testNumber, onClose, onSubmit }) => {
    const questions = testNumber === 1 ? mock1Questions : mock2Questions;
    const [answers, setAnswers] = useState(['', '', '']);
    const [submitting, setSubmitting] = useState(false);

    const handleOptionSelect = (qIdx, optionKey) => {
        const newAnswers = [...answers];
        newAnswers[qIdx] = optionKey;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (answers.includes('')) {
            alert("Please answer all questions");
            return;
        }
        setSubmitting(true);
        await onSubmit(answers);
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] shadow-2xl p-6 md:p-8 relative flex flex-col">
                <button 
                    onClick={onClose}
                    className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors z-10"
                >
                    <X size={18} />
                </button>

                <div className="mb-6 border-b border-slate-100 pb-4 shrink-0 pr-10">
                    <h2 className="text-2xl font-bold text-slate-800">Mock Test {testNumber}</h2>
                    <p className="text-slate-500 mt-1 text-sm">Answer the following questions to proceed to the next stage.</p>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-2">
                    {questions.map((q, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-semibold text-slate-800 mb-4">{idx + 1}. {q.q}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(q.options).map(([key, value]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleOptionSelect(idx, key)}
                                        className={`p-3 text-left rounded-xl border transition-all text-sm font-medium ${
                                            answers[idx] === key 
                                            ? 'bg-primary/10 border-primary/50 text-primary shadow-sm' 
                                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span className="inline-block w-6 text-slate-400">{key}.</span> {value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-4">
                    <button 
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full btn-primary py-4 rounded-xl text-lg font-bold disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {submitting ? 'Evaluating...' : 'Submit Answers'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MockTestModal;
