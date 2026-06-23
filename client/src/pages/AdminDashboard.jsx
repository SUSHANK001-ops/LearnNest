import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Users, Plus, FileText, Video, BarChart3, TrendingUp, Upload } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AddModal from '../components/AddModal';
import { API_URL } from '../config';

const AdminDashboard = () => {
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('course');
  const [modalTitle, setModalTitle] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchMyInstitution(); }, []);
  useEffect(() => { if (institution) fetchAllData(); }, [institution]);

  const getToken = () => localStorage.getItem('token');
  const authHeaders = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

  const fetchMyInstitution = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/institutions/my`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { if (res.status === 401) { localStorage.removeItem('token'); navigate('/login'); return; } }
      else setInstitution(data.data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchAllData = async () => {
    const token = getToken();
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [coursesRes, studentsRes, teachersRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/api/courses`, { headers }),
        fetch(`${API_URL}/api/students`, { headers }),
        fetch(`${API_URL}/api/teachers`, { headers }),
        fetch(`${API_URL}/api/analytics/institution`, { headers }),
      ]);
      if (coursesRes.ok) setCourses((await coursesRes.json()).data);
      if (studentsRes.ok) setStudents((await studentsRes.json()).data);
      if (teachersRes.ok) setTeachers((await teachersRes.json()).data);
      if (analyticsRes.ok) setAnalytics((await analyticsRes.json()).data);
    } catch (err) { console.error('Fetch error:', err); }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setModalTitle(item ? `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}` : `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`);
    setModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    const endpoints = { course: '/api/courses', student: '/api/students', teacher: '/api/teachers' };
    const url = editingItem ? `${API_URL}${endpoints[modalType]}/${editingItem.id}` : `${API_URL}${endpoints[modalType]}`;
    const res = await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(formData) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to save');
    setModalOpen(false); setEditingItem(null); fetchAllData();
  };

  const handleDelete = async (type, id) => {
    if (!confirm(`Delete this ${type}?`)) return;
    const endpoints = { course: '/api/courses', student: '/api/students', teacher: '/api/teachers' };
    const res = await fetch(`${API_URL}${endpoints[type]}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
    if (!res.ok) { const d = await res.json(); alert(d.message); return; }
    fetchAllData();
  };

  const stats = [
    { label: 'Students', value: students.length, icon: GraduationCap, color: 'from-blue-500 to-cyan-400', bg: 'bg-brand-50', text: 'text-brand-600' },
    { label: 'Courses', value: courses.length, icon: BookOpen, color: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Teachers', value: teachers.length, icon: Users, color: 'from-purple-500 to-violet-400', bg: 'bg-accent-50', text: 'text-accent-600' },
    { label: 'Storage', value: analytics?.storage?.totalMB ? `${analytics.storage.totalMB} MB` : '0 MB', icon: BarChart3, color: 'from-amber-500 to-orange-400', bg: 'bg-amber-50', text: 'text-amber-600' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Courses' },
    { id: 'students', label: 'Students' },
    { id: 'teachers', label: 'Teachers' },
  ];

  if (loading) return (
    <DashboardLayout role="institution_admin">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="institution_admin">
      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {!institution ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">No Institution Assigned</h3>
          <p className="text-sm text-slate-500 mt-2">Please contact the super admin to assign you to an institution.</p>
        </div>
      ) : (
        <>
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">{institution.name}</h1>
            <p className="text-sm text-slate-500 mt-1">{institution.domain} • {institution.email}</p>
          </div>

          {/* Stats Grid */}
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
                  <div className="flex items-center gap-1 mt-3">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">Active</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Courses */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-slate-800">Recent Courses</h3>
                  <button onClick={() => setActiveTab('courses')} className="text-xs text-brand-600 hover:text-brand-700 font-medium">View All</button>
                </div>
                <div className="space-y-3">
                  {courses.slice(0, 5).map(course => (
                    <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{course.title}</p>
                        <p className="text-xs text-slate-500">{course.teacher?.name || 'No teacher'}</p>
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No courses yet</p>}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                <h3 className="text-base font-semibold text-slate-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Add Course', icon: BookOpen, color: 'bg-brand-50 text-brand-600 hover:bg-brand-100', action: () => openModal('course') },
                    { label: 'Add Student', icon: GraduationCap, color: 'bg-brand-50 text-brand-600 hover:bg-brand-100', action: () => openModal('student') },
                    { label: 'Add Teacher', icon: Users, color: 'bg-accent-50 text-accent-600 hover:bg-accent-100', action: () => openModal('teacher') },
                    { label: 'Bulk Import', icon: Upload, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100', action: () => navigate('/admin/bulk-import') },
                  ].map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <button key={i} onClick={action.action} className={`flex items-center gap-3 p-4 rounded-xl ${action.color} transition-colors`}>
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Courses */}
          {activeTab === 'courses' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-800">{courses.length} Courses</h2>
                <button onClick={() => openModal('course')} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-medium shadow-lg shadow-brand-500/20">
                  <Plus className="w-4 h-4" /> Add Course
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(course => (
                  <div key={course.id} className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal('course', course)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-xs">Edit</button>
                        <button onClick={() => handleDelete('course', course.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 text-xs">Delete</button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">{course.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{course.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>{course.teacher?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && (
                  <div className="col-span-full bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No courses yet. Create your first course!</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tab: Students */}
          {activeTab === 'students' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-800">{students.length} Students</h2>
                <button onClick={() => openModal('student')} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-medium shadow-lg shadow-brand-500/20">
                  <Plus className="w-4 h-4" /> Add Student
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Courses</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {students.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4"><div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-semibold">{s.name[0]}</div>
                          <span className="text-sm font-medium text-slate-800">{s.name}</span>
                        </div></td>
                        <td className="px-6 py-4 text-sm text-slate-500">{s.email}</td>
                        <td className="px-6 py-4"><span className="px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-lg">{s.enrolledCourses?.length || 0} courses</span></td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openModal('student', s)} className="text-xs text-brand-600 hover:text-brand-700 font-medium mr-3">Edit</button>
                          <button onClick={() => handleDelete('student', s.id)} className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {students.length === 0 && <div className="p-12 text-center text-slate-400 text-sm">No students yet</div>}
              </div>
            </>
          )}

          {/* Tab: Teachers */}
          {activeTab === 'teachers' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-800">{teachers.length} Teachers</h2>
                <button onClick={() => openModal('teacher')} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-medium shadow-lg shadow-brand-500/20">
                  <Plus className="w-4 h-4" /> Add Teacher
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map(t => (
                  <div key={t.id} className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">{t.name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.email}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 mb-3">{t.assignedCourses?.length || 0} courses assigned</div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal('teacher', t)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs text-slate-600 font-medium transition-colors">Edit</button>
                      <button onClick={() => handleDelete('teacher', t.id)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-xs text-red-600 font-medium transition-colors">Delete</button>
                    </div>
                  </div>
                ))}
                {teachers.length === 0 && (
                  <div className="col-span-full bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No teachers yet. Add your first teacher!</p>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      <AddModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        onSubmit={handleModalSubmit}
        title={modalTitle}
        type={modalType}
        initialData={editingItem}
        courses={courses}
        teachers={teachers}
      />
    </DashboardLayout>
  );
};

export default AdminDashboard;
