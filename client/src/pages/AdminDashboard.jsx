import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Plus, 
  LogOut,
  Building2
} from 'lucide-react';
import MyInstitutionCard from '../components/MyInstitutionCard';
import CourseCard from '../components/CourseCard';
import StudentTable from '../components/StudentTable';
import TeacherList from '../components/TeacherList';
import AddModal from '../components/AddModal';
import { API_URL } from '../config';

const AdminDashboard = () => {
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('course');
  const [modalTitle, setModalTitle] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    fetchMyInstitution();
  }, []);

  useEffect(() => {
    if (institution) {
      fetchData();
    }
  }, [institution]);

  const fetchMyInstitution = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/institutions/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        if (response.status === 404) {
          setInstitution(null);
          setError('');
        } else {
          throw new Error(data.message || 'Failed to fetch institution');
        }
      } else {
        setInstitution(data.data);
        setError('');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching institution:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoadingData(true);
    const token = localStorage.getItem('token');

    try {
      // Always fetch all data for overview stats
      const coursesRes = await fetch(`${API_URL}/api/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.data);
      }

      const studentsRes = await fetch(`${API_URL}/api/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData.data);
      }

      const teachersRes = await fetch(`${API_URL}/api/teachers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    
    const titles = {
      course: item ? 'Edit Course' : 'Add New Course',
      student: item ? 'Edit Student' : 'Add New Student',
      teacher: item ? 'Edit Teacher' : 'Add New Teacher'
    };
    
    setModalTitle(titles[type]);
    setModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    const token = localStorage.getItem('token');
    const endpoints = {
      course: '/api/courses',
      student: '/api/students',
      teacher: '/api/teachers'
    };

    try {
      const url = editingItem 
        ? `${API_URL}${endpoints[modalType]}/${editingItem._id}`
        : `${API_URL}${endpoints[modalType]}`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save');
      }

      setModalOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    const token = localStorage.getItem('token');
    const endpoints = {
      course: '/api/courses',
      student: '/api/students',
      teacher: '/api/teachers'
    };

    try {
      const response = await fetch(`${API_URL}${endpoints[type]}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete');
      }

      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEnrollStudent = async (student) => {
    const courseId = prompt('Enter Course ID to enroll student:');
    if (!courseId) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/students/${student._id}/enroll`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to enroll');
      }

      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignTeacher = async (teacher) => {
    const courseId = prompt('Enter Course ID to assign teacher:');
    if (!courseId) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/teachers/${teacher._id}/assign`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to assign');
      }

      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'courses', name: 'Courses', icon: BookOpen },
    { id: 'students', name: 'Students', icon: GraduationCap },
    { id: 'teachers', name: 'Teachers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user?.username || 'Admin'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">Institution Admin Dashboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        {institution && (
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2
                      `}
                    >
                      <IconComponent className="w-5 h-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">My Institution</h2>
              <p className="text-sm text-gray-600 mt-1">View your institution details</p>
            </div>

            <MyInstitutionCard institution={institution} loading={loading} />

            {institution && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="shrink-0 bg-blue-100 rounded-md p-3">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Students</p>
                      <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="shrink-0 bg-green-100 rounded-md p-3">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Courses</p>
                      <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="shrink-0 bg-purple-100 rounded-md p-3">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Teachers</p>
                      <p className="text-2xl font-semibold text-gray-900">{teachers.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'courses' && institution && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Courses</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your institution&apos;s courses</p>
              </div>
              <button
                onClick={() => openModal('course')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Course
              </button>
            </div>

            {loadingData ? (
              <div className="text-center py-12">Loading courses...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length > 0 ? (
                  courses.map(course => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      onEdit={(c) => openModal('course', c)}
                      onDelete={(c) => handleDelete('course', c._id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">No courses yet. Create your first course!</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'students' && institution && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Students</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your institution&apos;s students</p>
              </div>
              <button
                onClick={() => openModal('student')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Student
              </button>
            </div>

            {loadingData ? (
              <div className="text-center py-12">Loading students...</div>
            ) : (
              <StudentTable
                students={students}
                onEdit={(s) => openModal('student', s)}
                onDelete={(s) => handleDelete('student', s._id)}
                onEnroll={handleEnrollStudent}
              />
            )}
          </>
        )}

        {activeTab === 'teachers' && institution && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Teachers</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your institution&apos;s teachers</p>
              </div>
              <button
                onClick={() => openModal('teacher')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Teacher
              </button>
            </div>

            {loadingData ? (
              <div className="text-center py-12">Loading teachers...</div>
            ) : (
              <TeacherList
                teachers={teachers}
                onEdit={(t) => openModal('teacher', t)}
                onDelete={(t) => handleDelete('teacher', t._id)}
                onAssign={handleAssignTeacher}
              />
            )}
          </>
        )}

        {!institution && !loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Institution Assigned</h3>
            <p className="mt-1 text-sm text-gray-500">
              Please contact the super admin to assign you to an institution.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AddModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleModalSubmit}
        title={modalTitle}
        type={modalType}
        initialData={editingItem}
        courses={courses}
        teachers={teachers}
      />
    </div>
  );
};

export default AdminDashboard;
