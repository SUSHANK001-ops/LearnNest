import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, GraduationCap, Users, Building2, Upload,
  BarChart3, Bell, Settings, ChevronLeft, ChevronRight,
  LogOut, FileText, Video, ClipboardList, Menu
} from 'lucide-react';

const roleMenus = {
  superadmin: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/superadmin/dashboard' },
    { id: 'manage-admins', label: 'Manage Admins', icon: Users, path: '/superadmin/manage-admins' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/superadmin/analytics' },
  ],
  institution_admin: [
    { id: 'overview', label: 'Overview', icon: Home, path: '/admin/dashboard' },
    { id: 'courses', label: 'Courses', icon: BookOpen, path: '/admin/courses' },
    { id: 'students', label: 'Students', icon: GraduationCap, path: '/admin/students' },
    { id: 'teachers', label: 'Teachers', icon: Users, path: '/admin/teachers' },
    { id: 'bulk-import', label: 'Bulk Import', icon: Upload, path: '/admin/bulk-import' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/admin/notifications' },
  ],
  teacher: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/teacher/dashboard' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, path: '/teacher/courses' },
    { id: 'quizzes', label: 'Quizzes', icon: ClipboardList, path: '/teacher/quizzes' },
    { id: 'files', label: 'Files', icon: FileText, path: '/teacher/files' },
    { id: 'videos', label: 'Videos', icon: Video, path: '/teacher/videos' },
  ],
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/student/dashboard' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, path: '/student/courses' },
    { id: 'quizzes', label: 'Quizzes', icon: ClipboardList, path: '/student/quizzes' },
    { id: 'results', label: 'Results', icon: BarChart3, path: '/student/results' },
  ],
};

const Sidebar = ({ role, collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = roleMenus[role] || [];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen flex flex-col
          bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950
          border-r border-white/5 shadow-2xl
          transition-all duration-300 ease-in-out
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-72'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-white tracking-tight">LearnNest</h1>
              <p className="text-[11px] text-indigo-300/70 capitalize">{role?.replace('_', ' ')}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-400 rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'} transition-colors`} />
                {!collapsed && <span>{item.label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={onToggle}
            className="w-full hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {collapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : <><ChevronLeft className="w-5 h-5" /><span>Collapse</span></>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
