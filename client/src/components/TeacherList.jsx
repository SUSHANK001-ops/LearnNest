import PropTypes from 'prop-types';
import { UserPlus, Edit2, Trash2, Users } from 'lucide-react';

const TeacherList = ({ teachers, onEdit, onDelete, onAssign }) => {
  if (teachers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new teacher.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teachers.map((teacher) => (
        <div
          key={teacher._id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-lg">
                  {teacher.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                <p className="text-sm text-gray-600">{teacher.email}</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Assigned Courses</span>
              <span className="text-xs text-gray-500">
                {teacher.assignedCourses?.length || 0} course(s)
              </span>
            </div>
            <div className="space-y-1">
              {teacher.assignedCourses && teacher.assignedCourses.length > 0 ? (
                teacher.assignedCourses.map((course) => (
                  <div
                    key={course._id}
                    className="text-sm bg-purple-50 text-purple-700 px-3 py-1.5 rounded-md"
                  >
                    📘 {course.title}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic py-2">No courses assigned</p>
              )}
            </div>
          </div>

          <div className="flex space-x-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => onAssign(teacher)}
              className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
              title="Assign to Course"
            >
              <span className="flex items-center justify-center">
                <UserPlus className="w-4 h-4 mr-1" />
                Assign
              </span>
            </button>
            <button
              onClick={() => onEdit(teacher)}
              className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit Teacher"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(teacher)}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Teacher"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

TeacherList.propTypes = {
  teachers: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      assignedCourses: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string,
          title: PropTypes.string,
        })
      ),
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
};

export default TeacherList;
