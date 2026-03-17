import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import Banner from '../components/Banner';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        applied: 0,
        interview: 0,
        rejected: 0,
        offer: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/jobs');
                const jobs = response.data.data || response.data; // Handle different API response structures

                const counts = jobs.reduce((acc, job) => {
                    acc.total++;
                    acc[job.status.toLowerCase()]++;
                    return acc;
                }, { total: 0, applied: 0, interview: 0, rejected: 0, offer: 0 });

                setStats(counts);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="p-8">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-slate-800 mb-1">Overview</h1>
                <p className="text-slate-500">Monitor your application progress at a glance.</p>
            </header>

            <Banner message="You have an interview coming up soon! Check your email for details." />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Total Applications" value={stats.total} type="total" />
                <StatCard title="Applied" value={stats.applied} type="applied" />
                <StatCard title="Interview" value={stats.interview} type="interview" />
                <StatCard title="Rejected" value={stats.rejected} type="rejected" />
                <StatCard title="Offers" value={stats.offer} type="offer" />
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        <p className="text-slate-400 text-sm italic">Feature coming soon: Visualized activity timeline.</p>
                    </div>
                </div>
                <div className="bg-primary p-8 rounded-[2rem] text-white shadow-xl shadow-primary/20 flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Job Search Tip</h2>
                        <p className="opacity-90 leading-relaxed text-lg">
                            Tailor your resume for each application to increase your interview chances by up to 60%.
                        </p>
                    </div>
                    <button className="bg-white text-primary px-6 py-2 rounded-xl font-bold text-sm self-start mt-6 mt-auto">
                        Read More
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
