import { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle2, Clock, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'announcement', recipientId: '', courseId: '' });
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [sending, setSending] = useState(false);

  const getToken = () => localStorage.getItem('token');
  const headers = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

  useEffect(() => { fetchNotifications(); fetchCourses(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications?limit=50`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setNotifications((await res.json()).data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setCourses((await res.json()).data || []);
    } catch (err) { console.error(err); }
  };

  const sendNotification = async () => {
    if (!form.title || !form.message) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify(form)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setShowCreate(false);
      setForm({ title: '', message: '', type: 'announcement', recipientId: '', courseId: '' });
      fetchNotifications();
    } catch (err) { alert(err.message); }
    finally { setSending(false); }
  };

  const typeColors = {
    assignment: 'bg-accent-100 text-accent-700',
    content: 'bg-brand-100 text-brand-700',
    quiz: 'bg-emerald-100 text-emerald-700',
    announcement: 'bg-sky-100 text-sky-700',
  };

  const typeIcons = {
    assignment: '📋', content: '📄', quiz: '🧪', announcement: '📢',
  };

  if (loading) return (
    <DashboardLayout role="institution_admin">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="institution_admin">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Notifications</h1>
          <p className="text-sm text-surface-500 mt-1">Manage and send notifications to users</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-medium shadow-lg shadow-brand-600/20">
          <Send className="w-4 h-4" /> New Notification
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} className={`bg-white rounded-2xl border border-surface-200/60 p-5 hover:shadow-md transition-all animate-fade-in ${!n.isRead ? 'border-l-4 border-l-brand-500' : ''}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColors[n.type] || 'bg-surface-100'}`}>
                <span className="text-lg">{typeIcons[n.type] || '🔔'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-surface-800">{n.title}</p>
                    <p className="text-sm text-surface-600 mt-1">{n.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${typeColors[n.type] || 'bg-surface-100 text-surface-600'}`}>
                      {n.type}
                    </span>
                    {n.isRead ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-accent-500" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-surface-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-surface-200/60 p-12 text-center">
            <Bell className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <p className="text-surface-500">No notifications yet.</p>
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-surface-800 mb-4">Send Notification</h3>
            <div className="space-y-3">
              <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Notification title"
                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400" />
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Message" rows={3}
                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 resize-none" />
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                <option value="announcement">Announcement</option>
                <option value="assignment">Assignment</option>
                <option value="content">Content</option>
                <option value="quiz">Quiz</option>
              </select>
              <select value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                <option value="">All courses (broadcast)</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={sendNotification} disabled={sending} className="px-4 py-2 text-sm bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-medium disabled:opacity-50">
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default NotificationsPage;
