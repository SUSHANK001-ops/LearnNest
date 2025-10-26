import Course from '../models/Course.js';
import Teacher from '../models/Teacher.js';

// @desc    Create a new course
// @route   POST /api/courses
// @access  Institution Admin only
export const createCourse = async (req, res) => {
  try {
    const { title, description, teacher } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description'
      });
    }

    // If teacher is provided, verify it belongs to the same institution
    if (teacher) {
      const teacherDoc = await Teacher.findById(teacher);
      if (!teacherDoc) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }
      if (teacherDoc.institutionId.toString() !== req.user.institutionId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Teacher does not belong to your institution'
        });
      }
    }

    // Create new course
    const course = await Course.create({
      title,
      description,
      teacher: teacher || null,
      institutionId: req.user.institutionId,
      createdBy: req.user._id
    });

    // If teacher assigned, add course to teacher's assignedCourses
    if (teacher) {
      await Teacher.findByIdAndUpdate(
        teacher,
        { $addToSet: { assignedCourses: course._id } }
      );
    }

    const populatedCourse = await Course.findById(course._id).populate('teacher', 'name email');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: populatedCourse
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

// @desc    Get all courses for institution
// @route   GET /api/courses
// @access  Institution Admin only
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ institutionId: req.user.institutionId })
      .populate('teacher', 'name email')
      .populate('createdBy', 'fullname email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Institution Admin only
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('createdBy', 'fullname email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify course belongs to admin's institution
    if (course.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Institution Admin only
export const updateCourse = async (req, res) => {
  try {
    const { title, description, teacher } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify course belongs to admin's institution
    if (course.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // If teacher is being changed, verify new teacher belongs to the same institution
    if (teacher && teacher !== course.teacher?.toString()) {
      const teacherDoc = await Teacher.findById(teacher);
      if (!teacherDoc) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }
      if (teacherDoc.institutionId.toString() !== req.user.institutionId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Teacher does not belong to your institution'
        });
      }

      // Remove course from old teacher's assignedCourses
      if (course.teacher) {
        await Teacher.findByIdAndUpdate(
          course.teacher,
          { $pull: { assignedCourses: course._id } }
        );
      }

      // Add course to new teacher's assignedCourses
      await Teacher.findByIdAndUpdate(
        teacher,
        { $addToSet: { assignedCourses: course._id } }
      );
    }

    // Update course fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (teacher !== undefined) course.teacher = teacher || null;

    await course.save();

    const updatedCourse = await Course.findById(course._id).populate('teacher', 'name email');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Institution Admin only
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify course belongs to admin's institution
    if (course.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove course from teacher's assignedCourses
    if (course.teacher) {
      await Teacher.findByIdAndUpdate(
        course.teacher,
        { $pull: { assignedCourses: course._id } }
      );
    }

    // Remove course from all students' enrolledCourses
    const Student = (await import('../models/Student.js')).default;
    await Student.updateMany(
      { enrolledCourses: course._id },
      { $pull: { enrolledCourses: course._id } }
    );

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};
