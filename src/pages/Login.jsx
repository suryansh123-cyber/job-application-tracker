import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogIn, UserPlus, ShieldCheck, AlertCircle } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin ? { email, password } : { username, email, password };

            const response = await api.post(endpoint, payload);

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/');
            } else {
                setError(response.data.message || 'Authentication failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
            <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-[2rem] shadow-2xl shadow-blue-100 overflow-hidden border border-white">
                {/* Left Side: Illustration Area */}
                <div className="hidden md:flex flex-col justify-center p-12 bg-primary/5">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <ShieldCheck size={32} />
                        </div>
                        <h1 className="text-4xl font-bold text-slate-800 leading-tight">
                            Manage your <span className="text-primary">career journey</span> with ease.
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Track applications, store resumes, and get insights into your job search process.
                        </p>
                        <div className="pt-8 grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <p className="text-2xl font-bold text-slate-800">100%</p>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Free for Students</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <p className="text-2xl font-bold text-slate-800">Secure</p>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Your Data is Private</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form Area */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">
                            {isLogin ? 'Welcome Back' : 'Join JOBTRACK PRO'}
                        </h2>
                        <p className="text-slate-500">
                            {isLogin ? 'Login to continue your tracking' : 'Create an account to get started'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={18} />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 ml-1">Username</label>
                                <input
                                    type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                                    placeholder="johndoe"
                                    className="input-field py-3"
                                />
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
                            <input
                                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="input-field py-3"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 ml-1">Password</label>
                            <input
                                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input-field py-3"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 mt-6 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <p className="text-slate-500">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-primary font-bold hover:underline"
                            >
                                {isLogin ? 'Sign Up' : 'Login'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
