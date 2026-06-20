import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardList, BarChart3, Bell, TrendingUp, Clock, FileText } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const getToken = () => localStorage.getItem('token');

  const fetchData = async () => {
    const headers = { 'Authorization': `Bearer ${getToken()}` };
    try {
      const [coursesRes, quizzesRes, notifsRes] = await Promise.all([
        fetch(`${API_URL}/api/courses`, { headers }),
        fetch(`${API_URL}/api/quizzes`, { headers }),
        fetch(`${API_URL}/api/notifications?limit=5`, { headers }),
      ]);
      if (coursesRes.ok) setCourses((await coursesRes.json()).data || []);
      if (quizzesRes.ok) setQuizzes((await quizzesRes.json()).data || []);
      if (notifsRes.ok) setNotifications((await notifsRes.json()).data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const stats = [
    { label: 'Enrolled Courses', value: courses.length, icon: BookOpen, bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { label: 'Available Quizzes', value: quizzes.length, icon: ClipboardList, bg: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'Notifications', value: notifications.length, icon: Bell, bg: 'bg-amber-50', text: 'text-amber-600' },
  ];

  if (loading) return (
    <DashboardLayout role="student">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="student">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">View courses, attempt quizzes, and track progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">My Courses</h3>
          <div className="space-y-3">
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => navigate(`/student/courses/${course.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{course.title}</p>
                  <p className="text-xs text-slate-500">{course.teacher?.name || 'No teacher'}</p>
                </div>
                <span className="text-xs text-slate-400">→</span>
              </button>
            ))}
            {courses.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No courses enrolled</p>}
          </div>
        </div>

        {/* Upcoming Quizzes */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Available Quizzes</h3>
          <div className="space-y-3">
            {quizzes.map(quiz => (
              <button
                key={quiz.id}
                onClick={() => navigate(`/student/quizzes/${quiz.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{quiz.title}</p>
                  <p className="text-xs text-slate-500">{quiz._count?.questions || 0} questions • {quiz.totalMarks} marks</p>
                </div>
                <span className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-indigo-50 text-indigo-700">
                  {quiz.duration ? `${quiz.duration} min` : 'Untimed'}
                </span>
              </button>
            ))}
            {quizzes.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No quizzes available</p>}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Recent Notifications</h3>
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl ${!n.isRead ? 'bg-indigo-50/50' : 'hover:bg-slate-50'} transition-colors`}>
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No notifications</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
