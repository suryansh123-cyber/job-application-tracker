import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CandidateDashboard from './pages/CandidateDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Jobs from './pages/Jobs';
import Login from './pages/Login';

const ProtectedRoute = ({ children, requireAdmin }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!isAuthenticated) return <Navigate to="/login" />;
    
    if (requireAdmin && user?.role !== 'Admin') {
        return <Navigate to="/" />;
    }

    return (
        <div className="flex bg-[#f8fafc] min-h-screen">
            <Navbar />
            <main className="flex-1 ml-64 min-w-0">
                {children}
            </main>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/" element={
                    <ProtectedRoute>
                        <CandidateDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/jobs" element={
                    <ProtectedRoute>
                        <Jobs />
                    </ProtectedRoute>
                } />

                <Route path="/admin" element={
                    <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
