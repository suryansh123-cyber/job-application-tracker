import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListTodo, LogOut, Briefcase } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isAdmin = user?.role === 'Admin';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 p-6 flex flex-col justify-between z-50">
            <div>
                <div className="flex items-center gap-2 mb-10">
                    <div className="w-8 h-8 text-primary flex-shrink-0">
                        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 15 85 Q 50 40 85 85 Z" fill="currentColor" stroke="none" />
                            <circle cx="50" cy="40" r="18" strokeWidth="10" />
                            <line x1="36" y1="54" x2="18" y2="72" strokeWidth="12" strokeLinecap="square" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-800">JOBTRACK <span className="text-primary">PRO</span></h1>
                </div>

                <div className="space-y-2">
                    {isAdmin ? (
                        <>
                            <NavLink
                                to="/admin"
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <LayoutDashboard size={20} />
                                Admin Dashboard
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/"
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <LayoutDashboard size={20} />
                                My Applications
                            </NavLink>
                            <NavLink
                                to="/jobs"
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <Briefcase size={20} />
                                Available Jobs
                            </NavLink>
                        </>
                    )}
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-all"
            >
                <LogOut size={20} />
                Logout
            </button>
        </nav>
    );
};

export default Navbar;
