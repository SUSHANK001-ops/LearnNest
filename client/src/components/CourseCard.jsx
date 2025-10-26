import PropTypes from 'prop-types';
import { Edit2, Trash2, User, Calendar } from 'lucide-react';

const CourseCard = ({ course, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{course.description}</p>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit(course)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit Course"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(course)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete Course"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center text-gray-600">
          <User className="w-5 h-5 mr-1.5" />
          <span>
            {course.teacher ? (
              <span className="font-medium">{course.teacher.name}</span>
            ) : (
              <span className="text-gray-400 italic">No teacher assigned</span>
            )}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(course.createdAt).toLocaleDateString()}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
            📘 Course
          </span>
        </div>
      </div>
    </div>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    teacher: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      email: PropTypes.string,
    }),
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default CourseCard;
