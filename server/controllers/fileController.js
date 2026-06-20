import { prisma } from '../config/db.js';
import { getStorageService } from '../services/storage/index.js';

// @desc    Upload a file to a course/folder
// @route   POST /api/files
// @access  Teacher, Institution Admin
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { courseId, folderId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify folder exists if provided
    if (folderId) {
      const folder = await prisma.folder.findUnique({ where: { id: folderId } });
      if (!folder || folder.courseId !== courseId) {
        return res.status(400).json({ success: false, message: 'Invalid folder' });
      }
    }

    // Upload to storage provider
    const storage = getStorageService();
    const folderPath = `learnnest/courses/${courseId}`;
    const result = await storage.upload(req.file, folderPath);

    // Create file record
    const file = await prisma.file.create({
      data: {
        name: req.file.originalname.replace(/\.[^/.]+$/, ''),
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: result.size || req.file.size,
        storageProvider: result.provider,
        storageUrl: result.url,
        storagePublicId: result.publicId,
        folderId: folderId || null,
        courseId,
        uploadedById: req.user.id
      }
    });

    res.status(201).json({ success: true, message: 'File uploaded successfully', data: file });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, message: 'Error uploading file', error: error.message });
  }
};

// @desc    Get files for a course/folder
// @route   GET /api/files?courseId=xxx&folderId=xxx
// @access  Teacher, Institution Admin, Student
export const getFiles = async (req, res) => {
  try {
    const { courseId, folderId } = req.query;

    const where = {};
    if (courseId) where.courseId = courseId;
    if (folderId) where.folderId = folderId;

    const files = await prisma.file.findMany({
      where,
      include: {
        uploadedBy: { select: { firstname: true, lastname: true } },
        folder: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: files.length, data: files });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ success: false, message: 'Error fetching files', error: error.message });
  }
};

// @desc    Get single file by ID
// @route   GET /api/files/:id
// @access  Teacher, Institution Admin, Student
export const getFileById = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id },
      include: {
        uploadedBy: { select: { firstname: true, lastname: true } },
        folder: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } }
      }
    });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.status(200).json({ success: true, data: file });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ success: false, message: 'Error fetching file', error: error.message });
  }
};

// @desc    Delete a file
// @route   DELETE /api/files/:id
// @access  Teacher, Institution Admin
export const deleteFile = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Delete from storage provider
    try {
      const storage = getStorageService();
      await storage.delete(file.storagePublicId, { resourceType: 'raw' });
    } catch (storageError) {
      console.error('Storage delete error (continuing):', storageError.message);
    }

    // Delete from database
    await prisma.file.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ success: false, message: 'Error deleting file', error: error.message });
  }
};
