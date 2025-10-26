import Student from '../models/Student.js';
import Course from '../models/Course.js';

// @desc    Create a new student
// @route   POST /api/students
// @access  Institution Admin only
export const createStudent = async (req, res) => {
  try {
    const { name, email, enrolledCourses } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email'
      });
    }

    // Check if student email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email already exists'
      });
    }

    // If courses are provided, verify they belong to the same institution
    if (enrolledCourses && enrolledCourses.length > 0) {
      const courses = await Course.find({ _id: { $in: enrolledCourses } });
      
      if (courses.length !== enrolledCourses.length) {
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

    // Create new student
    const student = await Student.create({
      name,
      email,
      enrolledCourses: enrolledCourses || [],
      institutionId: req.user.institutionId
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('enrolledCourses', 'title description');

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: populatedStudent
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating student',
      error: error.message
    });
  }
};

// @desc    Get all students for institution
// @route   GET /api/students
// @access  Institution Admin only
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ institutionId: req.user.institutionId })
      .populate('enrolledCourses', 'title description teacher')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Institution Admin only
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('enrolledCourses', 'title description teacher');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify student belongs to admin's institution
    if (student.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Institution Admin only
export const updateStudent = async (req, res) => {
  try {
    const { name, email, enrolledCourses } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify student belongs to admin's institution
    if (student.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // If email is being changed, check for uniqueness
    if (email && email !== student.email) {
      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'A student with this email already exists'
        });
      }
    }

    // If courses are being updated, verify they belong to the same institution
    if (enrolledCourses !== undefined) {
      const courses = await Course.find({ _id: { $in: enrolledCourses } });
      
      if (courses.length !== enrolledCourses.length) {
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

    // Update student fields
    if (name) student.name = name;
    if (email) student.email = email;
    if (enrolledCourses !== undefined) student.enrolledCourses = enrolledCourses;

    await student.save();

    const updatedStudent = await Student.findById(student._id)
      .populate('enrolledCourses', 'title description');

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Institution Admin only
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify student belongs to admin's institution
    if (student.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
};

// @desc    Enroll student in a course
// @route   PATCH /api/students/:id/enroll
// @access  Institution Admin only
export const enrollStudentInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify student belongs to admin's institution
    if (student.institutionId.toString() !== req.user.institutionId.toString()) {
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

    // Check if already enrolled
    if (student.enrolledCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course'
      });
    }

    // Add course to student's enrolledCourses
    student.enrolledCourses.push(courseId);
    await student.save();

    const updatedStudent = await Student.findById(student._id)
      .populate('enrolledCourses', 'title description');

    res.status(200).json({
      success: true,
      message: 'Student enrolled in course successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling student',
      error: error.message
    });
  }
};

// @desc    Unenroll student from a course
// @route   PATCH /api/students/:id/unenroll
// @access  Institution Admin only
export const unenrollStudentFromCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify student belongs to admin's institution
    if (student.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove course from student's enrolledCourses
    student.enrolledCourses = student.enrolledCourses.filter(
      course => course.toString() !== courseId
    );
    await student.save();

    const updatedStudent = await Student.findById(student._id)
      .populate('enrolledCourses', 'title description');

    res.status(200).json({
      success: true,
      message: 'Student unenrolled from course successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Error unenrolling student:', error);
    res.status(500).json({
      success: false,
      message: 'Error unenrolling student',
      error: error.message
    });
  }
};
