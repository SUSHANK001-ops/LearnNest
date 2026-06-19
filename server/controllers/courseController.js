import { prisma } from '../config/db.js';

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
      const teacherDoc = await prisma.teacher.findUnique({ where: { id: teacher } });
      if (!teacherDoc) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }
      if (teacherDoc.institutionId !== req.user.institutionId) {
        return res.status(403).json({
          success: false,
          message: 'Teacher does not belong to your institution'
        });
      }
    }

    // Create new course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        teacherId: teacher || null,
        institutionId: req.user.institutionId,
        createdById: req.user.id
      },
      include: {
        teacher: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
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
    const courses = await prisma.course.findMany({
      where: { institutionId: req.user.institutionId },
      include: {
        teacher: {
          select: { name: true, email: true }
        },
        createdBy: {
          select: { firstname: true, lastname: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

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
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: {
          select: { name: true, email: true }
        },
        createdBy: {
          select: { firstname: true, lastname: true, email: true }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify course belongs to admin's institution
    if (course.institutionId !== req.user.institutionId) {
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

    const course = await prisma.course.findUnique({ where: { id: req.params.id } });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify course belongs to admin's institution
    if (course.institutionId !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // If teacher is being changed, verify new teacher belongs to the same institution
    if (teacher && teacher !== course.teacherId) {
      const teacherDoc = await prisma.teacher.findUnique({ where: { id: teacher } });
      if (!teacherDoc) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }
      if (teacherDoc.institutionId !== req.user.institutionId) {
        return res.status(403).json({
          success: false,
          message: 'Teacher does not belong to your institution'
        });
      }
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (teacher !== undefined) updateData.teacherId = teacher || null;

    const updatedCourse = await prisma.course.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        teacher: {
          select: { name: true, email: true }
        }
      }
    });

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
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify course belongs to admin's institution
    if (course.institutionId !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete the course directly. Prisma handles implicit many-to-many cleanup with students automatically.
    await prisma.course.delete({ where: { id: req.params.id } });

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
