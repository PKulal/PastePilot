import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Code, LogOut, Plus, Activity, FileText, Star, Archive,
  Search, User, Settings, Shield,
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-colors ${
      active ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
    }`}
  >
    <Icon size={20} /> {label}
  </Link>
);

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const links = [
    { to: '/dashboard', icon: Activity, label: 'Dashboard' },
    { to: '/create', icon: Plus, label: 'Create Paste' },
    { to: '/pastes', icon: FileText, label: 'My Pastes' },
    { to: '/favorites', icon: Star, label: 'Favorites' },
    { to: '/archived', icon: Archive, label: 'Archived' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-outline-variant p-6 flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <Link to="/" className="flex items-center gap-2 font-inter font-bold text-xl text-primary mb-10">
          <Code className="text-primary" /> PasteBinPro
        </Link>
        <nav className="flex-1 flex flex-col gap-1">
          {links.map((l) => (
            <NavItem key={l.to} {...l} active={pathname === l.to} />
          ))}
          {user?.role === 'ADMIN' && (
            <NavItem to="/admin" icon={Shield} label="Admin Panel" active={pathname === '/admin'} />
          )}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-error hover:brightness-110 px-4 py-3 rounded-md transition-colors mt-4"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
};

export default DashboardLayout;
