import { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, BarChart3, TrendingUp, HardDrive } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_URL}/api/analytics`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) setAnalytics((await res.json()).data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <DashboardLayout role="institution_admin">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const stats = [
    { label: 'Total Students', value: analytics?.totalStudents || 0, icon: GraduationCap, bg: 'bg-brand-50', text: 'text-brand-600' },
    { label: 'Total Teachers', value: analytics?.totalTeachers || 0, icon: Users, bg: 'bg-accent-50', text: 'text-accent-600' },
    { label: 'Active Courses', value: analytics?.activeCourses || 0, icon: BookOpen, bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Total Quizzes', value: analytics?.totalQuizzes || 0, icon: BarChart3, bg: 'bg-sky-50', text: 'text-sky-600' },
  ];

  return (
    <DashboardLayout role="institution_admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Analytics</h1>
        <p className="text-sm text-surface-500 mt-1">Institution performance overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-surface-200/60 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-surface-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-surface-200/60 p-6">
          <h3 className="font-semibold text-surface-800 mb-4">Quiz Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-600">Average Score</span>
              <span className="text-sm font-semibold text-surface-800">{analytics?.avgQuizScore || 0}%</span>
            </div>
            <div className="w-full h-3 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-700" style={{ width: `${analytics?.avgQuizScore || 0}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-600">Completion Rate</span>
              <span className="text-sm font-semibold text-surface-800">{analytics?.quizCompletionRate || 0}%</span>
            </div>
            <div className="w-full h-3 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-500 to-accent-600 rounded-full transition-all duration-700" style={{ width: `${analytics?.quizCompletionRate || 0}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200/60 p-6">
          <h3 className="font-semibold text-surface-800 mb-4">Storage Usage</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-100" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="currentColor" strokeWidth="3" className="text-brand-500"
                  strokeDasharray={`${analytics?.storageUsedPercent || 0}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-surface-800">{analytics?.storageUsedPercent || 0}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-surface-500">Used</p>
                <p className="text-lg font-bold text-surface-800">{analytics?.storageUsed || '0 MB'}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500">Total Files</p>
                <p className="text-lg font-bold text-surface-800">{analytics?.totalFiles || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Breakdown */}
      <div className="bg-white rounded-2xl border border-surface-200/60 p-6">
        <h3 className="font-semibold text-surface-800 mb-4">Course Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Course</th>
                <th className="pb-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Students</th>
                <th className="pb-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Quizzes</th>
                <th className="pb-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Files</th>
                <th className="pb-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {(analytics?.courses || []).map(course => (
                <tr key={course.id} className="hover:bg-surface-50 transition-colors">
                  <td className="py-3 text-sm font-medium text-surface-800">{course.title}</td>
                  <td className="py-3 text-sm text-surface-600">{course._count?.students || 0}</td>
                  <td className="py-3 text-sm text-surface-600">{course._count?.quizzes || 0}</td>
                  <td className="py-3 text-sm text-surface-600">{course._count?.files || 0}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-[10px] font-semibold rounded-lg ${course.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-100 text-surface-600'}`}>
                      {course.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!analytics?.courses || analytics.courses.length === 0) && (
                <tr><td colSpan={5} className="py-8 text-center text-sm text-surface-400">No course data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
