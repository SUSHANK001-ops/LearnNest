import { useState, useEffect } from 'react';
import { Bell, Search, Menu, X } from 'lucide-react';
import { API_URL } from '../../config';

const TopBar = ({ user, onMenuToggle }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/notifications?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification:', err);
    }
  };

  const typeColors = {
    assignment: 'bg-accent-100 text-accent-700',
    content: 'bg-brand-100 text-brand-700',
    quiz: 'bg-emerald-100 text-emerald-700',
    announcement: 'bg-sky-100 text-sky-700',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-surface-200/60 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile menu + Search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative hidden sm:block max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-100 border-none rounded-xl text-sm text-surface-700 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-accent-500/30 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-surface-200/60 z-50 overflow-hidden">
                  <div className="p-4 border-b border-surface-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-surface-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs text-brand-600 font-medium">{unreadCount} new</span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                      <button
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`w-full text-left p-4 border-b border-surface-50 hover:bg-surface-50 transition-colors ${!n.isRead ? 'bg-brand-50/50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-full ${typeColors[n.type] || 'bg-surface-100 text-surface-600'}`}>
                            {n.type}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-surface-800 truncate">{n.title}</p>
                            <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        </div>
                      </button>
                    )) : (
                      <div className="p-8 text-center text-sm text-surface-400">No notifications</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-2 border-l border-surface-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-brand-500/20">
              {(user?.firstname || user?.username || 'U')[0].toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-surface-800 leading-tight">
                {user?.firstname || user?.username || 'User'}
              </p>
              <p className="text-[11px] text-surface-400 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
