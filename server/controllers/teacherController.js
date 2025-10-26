import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';

// @desc    Create a new teacher
// @route   POST /api/teachers
// @access  Institution Admin only
export const createTeacher = async (req, res) => {
  try {
    const { name, email, assignedCourses } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email'
      });
    }

    // Check if teacher email already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'A teacher with this email already exists'
      });
    }

    // If courses are provided, verify they belong to the same institution
    if (assignedCourses && assignedCourses.length > 0) {
      const courses = await Course.find({ _id: { $in: assignedCourses } });
      
      if (courses.length !== assignedCourses.length) {
        return res.status(404).json({
          success: false,
          message: 'One or more courses not found'
        });
      }

      const invalidCourse = courses.find(
        course => course.institutionId.toString() !== req.user.institutionId.toString()
      );

      if (invalidCourse) {
        return res.status(403).json({
          success: false,
          message: 'One or more courses do not belong to your institution'
        });
      }
    }

    // Create new teacher
    const teacher = await Teacher.create({
      name,
      email,
      assignedCourses: assignedCourses || [],
      institutionId: req.user.institutionId
    });

    // Update courses with the new teacher
    if (assignedCourses && assignedCourses.length > 0) {
      await Course.updateMany(
        { _id: { $in: assignedCourses } },
        { teacher: teacher._id }
      );
    }

    const populatedTeacher = await Teacher.findById(teacher._id)
      .populate('assignedCourses', 'title description');

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: populatedTeacher
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating teacher',
      error: error.message
    });
  }
};

// @desc    Get all teachers for institution
// @route   GET /api/teachers
// @access  Institution Admin only
export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ institutionId: req.user.institutionId })
      .populate('assignedCourses', 'title description')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teachers',
      error: error.message
    });
  }
};

// @desc    Get single teacher by ID
// @route   GET /api/teachers/:id
// @access  Institution Admin only
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('assignedCourses', 'title description');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Verify teacher belongs to admin's institution
    if (teacher.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teacher',
      error: error.message
    });
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Institution Admin only
export const updateTeacher = async (req, res) => {
  try {
    const { name, email } = req.body;

    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Verify teacher belongs to admin's institution
    if (teacher.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // If email is being changed, check for uniqueness
    if (email && email !== teacher.email) {
      const existingTeacher = await Teacher.findOne({ email });
      if (existingTeacher) {
        return res.status(400).json({
          success: false,
          message: 'A teacher with this email already exists'
        });
      }
    }

    // Update teacher fields
    if (name) teacher.name = name;
    if (email) teacher.email = email;

    await teacher.save();

    const updatedTeacher = await Teacher.findById(teacher._id)
      .populate('assignedCourses', 'title description');

    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      data: updatedTeacher
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating teacher',
      error: error.message
    });
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Institution Admin only
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Verify teacher belongs to admin's institution
    if (teacher.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove teacher from all assigned courses
    await Course.updateMany(
      { teacher: teacher._id },
      { teacher: null }
    );

    await teacher.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting teacher',
      error: error.message
    });
  }
};

// @desc    Assign teacher to a course
// @route   PATCH /api/teachers/:id/assign
// @access  Institution Admin only
export const assignTeacherToCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Verify teacher belongs to admin's institution
    if (teacher.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Verify course exists and belongs to the same institution
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Course does not belong to your institution'
      });
    }

    // Check if already assigned
    if (teacher.assignedCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Teacher is already assigned to this course'
      });
    }

    // If course has another teacher, remove the course from that teacher
    if (course.teacher && course.teacher.toString() !== teacher._id.toString()) {
      await Teacher.findByIdAndUpdate(
        course.teacher,
        { $pull: { assignedCourses: courseId } }
      );
    }

    // Add course to teacher's assignedCourses
    teacher.assignedCourses.push(courseId);
    await teacher.save();

    // Update course with the teacher
    course.teacher = teacher._id;
    await course.save();

    const updatedTeacher = await Teacher.findById(teacher._id)
      .populate('assignedCourses', 'title description');

    res.status(200).json({
      success: true,
      message: 'Teacher assigned to course successfully',
      data: updatedTeacher
    });
  } catch (error) {
    console.error('Error assigning teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning teacher',
      error: error.message
    });
  }
};

// @desc    Unassign teacher from a course
// @route   PATCH /api/teachers/:id/unassign
// @access  Institution Admin only
export const unassignTeacherFromCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Verify teacher belongs to admin's institution
    if (teacher.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove course from teacher's assignedCourses
    teacher.assignedCourses = teacher.assignedCourses.filter(
      course => course.toString() !== courseId
    );
    await teacher.save();

    // Update course to remove teacher
    await Course.findByIdAndUpdate(courseId, { teacher: null });

    const updatedTeacher = await Teacher.findById(teacher._id)
      .populate('assignedCourses', 'title description');

    res.status(200).json({
      success: true,
      message: 'Teacher unassigned from course successfully',
      data: updatedTeacher
    });
  } catch (error) {
    console.error('Error unassigning teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Error unassigning teacher',
      error: error.message
    });
  }
};
