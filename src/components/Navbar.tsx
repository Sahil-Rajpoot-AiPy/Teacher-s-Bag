import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, GraduationCap } from 'lucide-react';
import { auth } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, schoolName, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user || location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-emerald-500 p-2 rounded-lg group-hover:bg-emerald-600 transition-colors">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-stone-900 tracking-tight">Teacher's Bag</span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-stone-900">{schoolName}</p>
            <p className="text-xs text-stone-500">{profile?.role === 'admin' ? 'Administrator' : 'Teacher Portal'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
