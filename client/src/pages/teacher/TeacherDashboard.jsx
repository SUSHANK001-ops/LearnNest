import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardList, FileText, Video, Plus, Users, TrendingUp, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const getToken = () => localStorage.getItem('token');

  const fetchData = async () => {
    const headers = { 'Authorization': `Bearer ${getToken()}` };
    try {
      const [coursesRes, quizzesRes] = await Promise.all([
        fetch(`${API_URL}/api/courses`, { headers }),
        fetch(`${API_URL}/api/quizzes`, { headers }),
      ]);
      if (coursesRes.ok) setCourses((await coursesRes.json()).data || []);
      if (quizzesRes.ok) setQuizzes((await quizzesRes.json()).data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const stats = [
    { label: 'My Courses', value: courses.length, icon: BookOpen, bg: 'bg-brand-50', text: 'text-brand-600' },
    { label: 'Quizzes Created', value: quizzes.length, icon: ClipboardList, bg: 'bg-accent-50', text: 'text-accent-600' },
    { label: 'Published', value: quizzes.filter(q => q.isPublished).length, icon: TrendingUp, bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Total Students', value: courses.reduce((a, c) => a + (c.students?.length || 0), 0), icon: Users, bg: 'bg-blue-50', text: 'text-blue-600' },
  ];

  if (loading) return (
    <DashboardLayout role="teacher">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="teacher">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your courses, content, and assessments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        {/* My Courses */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">My Courses</h3>
          </div>
          <div className="space-y-3">
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => navigate(`/teacher/courses/${course.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{course.title}</p>
                  <p className="text-xs text-slate-500">{course.students?.length || 0} students enrolled</p>
                </div>
                <span className="text-xs text-slate-400">→</span>
              </button>
            ))}
            {courses.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No courses assigned yet</p>
            )}
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">Recent Quizzes</h3>
            <button onClick={() => navigate('/teacher/quizzes')} className="text-xs text-brand-600 hover:text-brand-700 font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {quizzes.slice(0, 5).map(quiz => (
              <div key={quiz.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${quiz.isPublished ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                  <ClipboardList className={`w-5 h-5 ${quiz.isPublished ? 'text-emerald-600' : 'text-amber-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{quiz.title}</p>
                  <p className="text-xs text-slate-500">{quiz._count?.questions || 0} questions • {quiz._count?.attempts || 0} attempts</p>
                </div>
                <span className={`px-2 py-1 text-[10px] font-semibold rounded-lg ${quiz.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {quiz.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
            {quizzes.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No quizzes yet</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
