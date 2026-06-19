import { prisma } from '../config/db.js';

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
    const existingStudent = await prisma.student.findUnique({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email already exists'
      });
    }

    // If courses are provided, verify they belong to the same institution
    if (enrolledCourses && enrolledCourses.length > 0) {
      const courses = await prisma.course.findMany({ where: { id: { in: enrolledCourses } } });
      
      if (courses.length !== enrolledCourses.length) {
        return res.status(404).json({
          success: false,
          message: 'One or more courses not found'
        });
      }

      const invalidCourse = courses.find(
        course => course.institutionId !== req.user.institutionId
      );

      if (invalidCourse) {
        return res.status(403).json({
          success: false,
          message: 'One or more courses do not belong to your institution'
        });
      }
    }

    // Create new student
    const studentData = {
      name,
      email,
      institutionId: req.user.institutionId
    };

    if (enrolledCourses && enrolledCourses.length > 0) {
      studentData.enrolledCourses = {
        connect: enrolledCourses.map(id => ({ id }))
      };
    }

    const student = await prisma.student.create({
      data: studentData,
      include: {
        enrolledCourses: {
          select: { title: true, description: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
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
    const students = await prisma.student.findMany({
      where: { institutionId: req.user.institutionId },
      include: {
        enrolledCourses: {
          select: { 
            title: true, 
            description: true, 
            teacher: { select: { name: true } } 
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

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
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        enrolledCourses: {
          select: { 
            id: true,
            title: true, 
            description: true, 
            teacher: { select: { name: true } } 
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify student belongs to admin's institution
    if (student.institutionId !== req.user.institutionId) {
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

    const student = await prisma.student.findUnique({ where: { id: req.params.id } });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify student belongs to admin's institution
    if (student.institutionId !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // If email is being changed, check for uniqueness
    if (email && email !== student.email) {
      const existingStudent = await prisma.student.findUnique({ where: { email } });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'A student with this email already exists'
        });
      }
    }

    // If courses are being updated, verify they belong to the same institution
    if (enrolledCourses !== undefined) {
      const courses = await prisma.course.findMany({ where: { id: { in: enrolledCourses } } });
      
      if (courses.length !== enrolledCourses.length) {
        return res.status(404).json({
          success: false,
          message: 'One or more courses not found'
        });
      }

      const invalidCourse = courses.find(
        course => course.institutionId !== req.user.institutionId
      );

      if (invalidCourse) {
        return res.status(403).json({
          success: false,
          message: 'One or more courses do not belong to your institution'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (enrolledCourses !== undefined) {
      updateData.enrolledCourses = {
        set: enrolledCourses.map(id => ({ id }))
      };
    }

    const updatedStudent = await prisma.student.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        enrolledCourses: {
          select: { title: true, description: true }
        }
      }
    });

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
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify student belongs to admin's institution
    if (student.institutionId !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await prisma.student.delete({ where: { id: req.params.id } });

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

    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: { enrolledCourses: true }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify student belongs to admin's institution
    if (student.institutionId !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Verify course exists and belongs to the same institution
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.institutionId !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Course does not belong to your institution'
      });
    }

    // Check if already enrolled
    if (student.enrolledCourses.some(c => c.id === courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course'
      });
    }

    const updatedStudent = await prisma.student.update({
      where: { id: req.params.id },
      data: {
        enrolledCourses: {
          connect: { id: courseId }
        }
      },
      include: {
        enrolledCourses: {
          select: { title: true, description: true }
        }
      }
    });

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

    const student = await prisma.student.findUnique({ where: { id: req.params.id } });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify student belongs to admin's institution
    if (student.institutionId !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedStudent = await prisma.student.update({
      where: { id: req.params.id },
      data: {
        enrolledCourses: {
          disconnect: { id: courseId }
        }
      },
      include: {
        enrolledCourses: {
          select: { title: true, description: true }
        }
      }
    });

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
