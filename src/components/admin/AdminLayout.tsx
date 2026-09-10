import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Layers, Library, LogOut, GraduationCap } from 'lucide-react';
import { auth } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/classes', label: 'Classes', icon: Layers },
  { to: '/admin/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/admin/materials', label: 'Lessons', icon: Library },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleLogout = async () => {
    if (!auth) return;
    await auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="hidden w-72 shrink-0 bg-white border-r border-stone-200 px-4 py-6 md:block">
          <Link to="/admin" className="flex items-center gap-3 px-2 mb-8">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-stone-500 leading-none">Teacher's Bag</p>
              <p className="text-lg font-semibold text-stone-900 leading-tight">Admin Panel</p>
            </div>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-stone-700 hover:bg-stone-100'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="bg-white border-b border-stone-200 px-4 py-3 md:h-16 md:px-6 md:py-0 flex items-center justify-between gap-4">
            <Link to="/admin" className="flex items-center gap-2 md:hidden">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-stone-500 leading-none">Teacher's Bag</p>
                <p className="font-semibold text-stone-900 leading-tight">Admin</p>
              </div>
            </Link>
            <h1 className="hidden text-xl font-semibold text-stone-900 md:block">Administration</h1>
            <div className="text-right">
              <p className="text-sm font-medium text-stone-900">{profile?.name || profile?.email || 'Admin'}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wide">{profile?.role || 'admin'}</p>
            </div>
          </header>

          <nav className="flex gap-2 overflow-x-auto border-b border-stone-200 bg-white px-4 py-3 md:hidden" aria-label="Admin navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 bg-stone-50'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </nav>

          <main className="p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
