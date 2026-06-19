import { prisma } from '../config/db.js';

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
    const existingTeacher = await prisma.teacher.findUnique({ where: { email } });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'A teacher with this email already exists'
      });
    }

    // If courses are provided, verify they belong to the same institution
    if (assignedCourses && assignedCourses.length > 0) {
      const courses = await prisma.course.findMany({ where: { id: { in: assignedCourses } } });
      
      if (courses.length !== assignedCourses.length) {
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

    const teacherData = {
      name,
      email,
      institutionId: req.user.institutionId
    };

    if (assignedCourses && assignedCourses.length > 0) {
      teacherData.assignedCourses = {
        connect: assignedCourses.map(id => ({ id }))
      };
    }

    // Create new teacher
    const teacher = await prisma.teacher.create({
      data: teacherData,
      include: {
        assignedCourses: {
          select: { title: true, description: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: teacher
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
    const teachers = await prisma.teacher.findMany({
      where: { institutionId: req.user.institutionId },
      include: {
        assignedCourses: {
          select: { title: true, description: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

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
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.params.id },
      include: {
        assignedCourses: {
          select: { id: true, title: true, description: true }
        }
      }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Verify teacher belongs to admin's institution
    if (teacher.institutionId !== req.user.institutionId) {
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

    const teacher = await prisma.teacher.findUnique({ where: { id: req.params.id } });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Verify teacher belongs to admin's institution
    if (teacher.institutionId !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // If email is being changed, check for uniqueness
    if (email && email !== teacher.email) {
      const existingTeacher = await prisma.teacher.findUnique({ where: { email } });
      if (existingTeacher) {
        return res.status(400).json({
          success: false,
          message: 'A teacher with this email already exists'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedTeacher = await prisma.teacher.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        assignedCourses: {
          select: { title: true, description: true }
        }
      }
    });

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
    const teacher = await prisma.teacher.findUnique({ where: { id: req.params.id } });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Verify teacher belongs to admin's institution
    if (teacher.institutionId !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove teacher from all assigned courses
    await prisma.course.updateMany({
      where: { teacherId: req.params.id },
      data: { teacherId: null }
    });

    await prisma.teacher.delete({ where: { id: req.params.id } });

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

    const teacher = await prisma.teacher.findUnique({
      where: { id: req.params.id },
      include: { assignedCourses: true }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Verify teacher belongs to admin's institution
    if (teacher.institutionId !== req.user.institutionId) {
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

    // Check if already assigned
    if (course.teacherId === teacher.id) {
      return res.status(400).json({
        success: false,
        message: 'Teacher is already assigned to this course'
      });
    }

    // Assigning the course to the teacher
    await prisma.course.update({
      where: { id: courseId },
      data: { teacherId: teacher.id }
    });

    const updatedTeacher = await prisma.teacher.findUnique({
      where: { id: req.params.id },
      include: {
        assignedCourses: { select: { title: true, description: true } }
      }
    });

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

    const teacher = await prisma.teacher.findUnique({ where: { id: req.params.id } });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Verify teacher belongs to admin's institution
    if (teacher.institutionId !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Unassign course from teacher
    await prisma.course.update({
      where: { id: courseId },
      data: { teacherId: null }
    });

    const updatedTeacher = await prisma.teacher.findUnique({
      where: { id: req.params.id },
      include: {
        assignedCourses: { select: { title: true, description: true } }
      }
    });

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
