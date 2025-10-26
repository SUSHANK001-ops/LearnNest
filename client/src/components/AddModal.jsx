import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const AddModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  type, 
  initialData = null,
  courses = [],
  teachers = []
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    description: '',
    teacher: '',
    enrolledCourses: [],
    assignedCourses: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        title: initialData.title || '',
        description: initialData.description || '',
        teacher: initialData.teacher?._id || '',
        enrolledCourses: initialData.enrolledCourses?.map(c => c._id) || [],
        assignedCourses: initialData.assignedCourses?.map(c => c._id) || []
      });
    } else {
      setFormData({
        name: '',
        email: '',
        title: '',
        description: '',
        teacher: '',
        enrolledCourses: [],
        assignedCourses: []
      });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e, field) => {
    const options = Array.from(e.target.selectedOptions);
    const values = options.map(option => option.value);
    setFormData(prev => ({ ...prev, [field]: values }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Course Form */}
          {type === 'course' && (
            <>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter course title"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter course description"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Teacher (Optional)
                </label>
                <select
                  id="teacher"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Student Form */}
          {type === 'student' && (
            <>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter student name"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="student@example.com"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="enrolledCourses" className="block text-sm font-medium text-gray-700 mb-2">
                  Enroll in Courses (Optional)
                </label>
                <select
                  id="enrolledCourses"
                  name="enrolledCourses"
                  multiple
                  value={formData.enrolledCourses}
                  onChange={(e) => handleMultiSelectChange(e, 'enrolledCourses')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  size="5"
                >
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple courses</p>
              </div>
            </>
          )}

          {/* Teacher Form */}
          {type === 'teacher' && (
            <>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter teacher name"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="teacher@example.com"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="assignedCourses" className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Courses (Optional)
                </label>
                <select
                  id="assignedCourses"
                  name="assignedCourses"
                  multiple
                  value={formData.assignedCourses}
                  onChange={(e) => handleMultiSelectChange(e, 'assignedCourses')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  size="5"
                >
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple courses</p>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : (initialData ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['course', 'student', 'teacher']).isRequired,
  initialData: PropTypes.object,
  courses: PropTypes.arrayOf(PropTypes.object),
  teachers: PropTypes.arrayOf(PropTypes.object),
};

export default AddModal;
