import PropTypes from 'prop-types';
import { UserPlus, Edit2, Trash2, GraduationCap } from 'lucide-react';

const StudentTable = ({ students, onEdit, onDelete, onEnroll }) => {
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No students</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new student.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enrolled Courses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{student.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                      student.enrolledCourses.map((course) => (
                        <span
                          key={course._id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {course.title}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 italic">No courses enrolled</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEnroll(student)}
                      className="text-green-600 hover:text-green-900"
                      title="Enroll in Course"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onEdit(student)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Student"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(student)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Student"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

StudentTable.propTypes = {
  students: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      enrolledCourses: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string,
          title: PropTypes.string,
        })
      ),
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEnroll: PropTypes.func.isRequired,
};

export default StudentTable;
