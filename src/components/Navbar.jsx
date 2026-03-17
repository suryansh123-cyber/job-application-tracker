import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListTodo, LogOut } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 p-6 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 mb-10">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">J</div>
                    <h1 className="text-xl font-bold tracking-tight">JobTrack<span className="text-primary">.</span></h1>
                </div>

                <div className="space-y-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/jobs"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <ListTodo size={20} />
                        Applications
                    </NavLink>
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
