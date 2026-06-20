import { prisma } from '../config/db.js';

// @desc    Create a new folder inside a course
// @route   POST /api/folders
// @access  Teacher, Institution Admin
export const createFolder = async (req, res) => {
  try {
    const { name, courseId, parentId } = req.body;

    if (!name || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide folder name and course ID'
      });
    }

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify user has access to this course
    if (req.user.role === 'teacher') {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.id } });
      if (!teacher || course.teacherId !== teacher.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    } else if (req.user.role === 'institution_admin') {
      if (course.institutionId !== req.user.institutionId) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    // If parentId is provided, verify it exists and belongs to the same course
    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({ where: { id: parentId } });
      if (!parentFolder || parentFolder.courseId !== courseId) {
        return res.status(400).json({ success: false, message: 'Invalid parent folder' });
      }
    }

    const folder = await prisma.folder.create({
      data: { name, courseId, parentId: parentId || null },
      include: { children: true, files: true, videos: true }
    });

    res.status(201).json({ success: true, message: 'Folder created successfully', data: folder });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ success: false, message: 'Error creating folder', error: error.message });
  }
};

// @desc    Get folders for a course (top-level or by parent)
// @route   GET /api/folders?courseId=xxx&parentId=xxx
// @access  Teacher, Institution Admin, Student
export const getFolders = async (req, res) => {
  try {
    const { courseId, parentId } = req.query;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    const where = { courseId };
    if (parentId) {
      where.parentId = parentId;
    } else {
      where.parentId = null; // Top-level folders only
    }

    const folders = await prisma.folder.findMany({
      where,
      include: {
        children: { select: { id: true, name: true } },
        files: { select: { id: true, name: true, mimeType: true, size: true } },
        videos: { select: { id: true, title: true, type: true } },
        _count: { select: { children: true, files: true, videos: true } }
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({ success: true, count: folders.length, data: folders });
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ success: false, message: 'Error fetching folders', error: error.message });
  }
};

// @desc    Get single folder with contents
// @route   GET /api/folders/:id
// @access  Teacher, Institution Admin, Student
export const getFolderById = async (req, res) => {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: req.params.id },
      include: {
        children: {
          include: { _count: { select: { children: true, files: true, videos: true } } },
          orderBy: { name: 'asc' }
        },
        files: { orderBy: { createdAt: 'desc' } },
        videos: { orderBy: { createdAt: 'desc' } },
        parent: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } }
      }
    });

    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    res.status(200).json({ success: true, data: folder });
  } catch (error) {
    console.error('Error fetching folder:', error);
    res.status(500).json({ success: false, message: 'Error fetching folder', error: error.message });
  }
};

// @desc    Update folder name
// @route   PUT /api/folders/:id
// @access  Teacher, Institution Admin
export const updateFolder = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Folder name is required' });
    }

    const folder = await prisma.folder.findUnique({ where: { id: req.params.id } });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    const updatedFolder = await prisma.folder.update({
      where: { id: req.params.id },
      data: { name }
    });

    res.status(200).json({ success: true, message: 'Folder updated successfully', data: updatedFolder });
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ success: false, message: 'Error updating folder', error: error.message });
  }
};

// @desc    Delete folder and all contents
// @route   DELETE /api/folders/:id
// @access  Teacher, Institution Admin
export const deleteFolder = async (req, res) => {
  try {
    const folder = await prisma.folder.findUnique({ where: { id: req.params.id } });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    // Cascade delete handles children, files, and videos via Prisma schema
    await prisma.folder.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ success: false, message: 'Error deleting folder', error: error.message });
  }
};

// @desc    Create default folder structure for a course
// @route   POST /api/folders/init/:courseId
// @access  Teacher, Institution Admin
export const initDefaultFolders = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if folders already exist
    const existingFolders = await prisma.folder.count({ where: { courseId } });
    if (existingFolders > 0) {
      return res.status(400).json({ success: false, message: 'Folders already exist for this course' });
    }

    const defaultFolders = ['Lectures', 'Assignments', 'Notes', 'PDFs', 'PPTs', 'Videos', 'Exams', 'Resources'];

    const folders = await Promise.all(
      defaultFolders.map(name => prisma.folder.create({ data: { name, courseId } }))
    );

    res.status(201).json({ success: true, message: 'Default folders created', data: folders });
  } catch (error) {
    console.error('Error creating default folders:', error);
    res.status(500).json({ success: false, message: 'Error creating default folders', error: error.message });
  }
};
