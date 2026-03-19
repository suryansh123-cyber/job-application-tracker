import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import ProgressBar from '../components/ProgressBar';
import MockTestModal from '../components/MockTestModal';
import { Briefcase, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const CandidateDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTest, setActiveTest] = useState(null); // { appId, testNumber }
    const [testResult, setTestResult] = useState('');

    const fetchApplications = async () => {
        try {
            const res = await api.get('/applications/me');
            if (res.data.success) {
                setApplications(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching applications', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleMockTestSubmit = async (answers) => {
        try {
            const res = await api.post(`/applications/${activeTest.appId}/mock-test`, {
                testNumber: activeTest.testNumber,
                answers: answers
            });

            if (res.data.success) {
                // Update applications list
                fetchApplications();
                if (res.data.passed) {
                    setTestResult(`Congratulations! You passed Mock Test ${activeTest.testNumber}.`);
                } else {
                    setTestResult(`Unfortunately, you did not pass Mock Test ${activeTest.testNumber}. Your application was marked as Rejected.`);
                }
                setTimeout(() => {
                    setActiveTest(null);
                    setTestResult('');
                }, 3000);
            }
        } catch (err) {
            console.error('Test submission failed', err);
            alert('Something went wrong submitting your test.');
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-1">My Applications</h1>
                    <p className="text-slate-500">Track your progress and complete necessary stages.</p>
                </div>
            </header>

            {loading ? (
                <div className="text-slate-500">Loading your applications...</div>
            ) : applications.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 shadow-sm flex flex-col items-center">
                    <Briefcase size={48} className="mb-4 opacity-30 text-primary" />
                    <h3 className="text-xl font-medium text-slate-700 mb-2">No Applications Yet</h3>
                    <p className="text-sm text-slate-500 max-w-sm">You haven't applied to any jobs. Head over to the Available Jobs tab to start your journey.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {applications.map(app => (
                        <div key={app._id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col gap-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{app.job_id?.title || 'Unknown Job'}</h2>
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide 
                                    ${app.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                                      app.status === 'SELECTED' ? 'bg-green-100 text-green-700' :
                                      'bg-blue-100 text-blue-700'}`}>
                                    {app.status === 'APPLIED' ? 'Under Review' : app.status.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <div className="bg-slate-50 rounded-2xl px-4 py-8 border border-slate-100 mb-2">
                                <ProgressBar status={app.status} rejectedAtStage={app.rejectedAtStage} />
                            </div>

                            <div className="border-t border-slate-100 pt-6 mt-2 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="text-sm text-slate-600">
                                    {app.status === 'APPLIED' && "Your resume is currently under review by our team."}
                                    {app.status === 'RESUME_SELECTED' && "Congratulations! Please complete Mock Test 1 to proceed."}
                                    {app.status === 'MOCK1_PASSED' && "Great job! Please complete Mock Test 2 to reach the interview."}
                                    {app.status === 'MOCK2_PASSED' && "Test passed. Waiting for the Admin to schedule your interview."}
                                    {app.status === 'INTERVIEW' && app.interviewDetails && (
                                        <div className="flex items-start gap-2 bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100">
                                            <Calendar size={20} className="shrink-0 text-blue-500 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-base mb-1">Interview Scheduled</p>
                                                <p>Date: <strong>{new Date(app.interviewDetails.date).toDateString()}</strong></p>
                                                <p>Time: <strong>{app.interviewDetails.time}</strong></p>
                                                <p>Venue: <strong>{app.interviewDetails.venue}</strong></p>
                                            </div>
                                        </div>
                                    )}
                                    {app.status === 'SELECTED' && "Congratulations! You've been selected for this position."}
                                    {app.status === 'REJECTED' && "Unfortunately, we are pursuing other candidates. Best of luck in your job search."}
                                </div>

                                <div>
                                    {app.status === 'RESUME_SELECTED' && (
                                        <button 
                                            onClick={() => setActiveTest({ appId: app._id, testNumber: 1 })}
                                            className="btn-primary py-3 px-8 rounded-xl font-bold shadow-lg shadow-primary/30"
                                        >
                                            Take Mock Test 1
                                        </button>
                                    )}
                                    {app.status === 'MOCK1_PASSED' && (
                                        <button 
                                            onClick={() => setActiveTest({ appId: app._id, testNumber: 2 })}
                                            className="btn-primary py-3 px-8 rounded-xl font-bold shadow-lg shadow-primary/30"
                                        >
                                            Take Mock Test 2
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTest && (
                <div className="relative z-50">
                    {testResult ? (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center shadow-2xl animate-in zoom-in-95">
                                {testResult.includes('passed') ? (
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={32} />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle size={32} />
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Test Result</h3>
                                <p className="text-slate-600">{testResult}</p>
                            </div>
                        </div>
                    ) : (
                        <MockTestModal 
                            testNumber={activeTest.testNumber}
                            onClose={() => setActiveTest(null)}
                            onSubmit={handleMockTestSubmit}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default CandidateDashboard;
