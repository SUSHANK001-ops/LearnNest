import { prisma } from '../config/db.js';
import { getStorageService } from '../services/storage/index.js';

// @desc    Upload a video or add YouTube video to course
// @route   POST /api/videos
// @access  Teacher, Institution Admin
export const createVideo = async (req, res) => {
  try {
    const { title, courseId, folderId, type, youtubeUrl } = req.body;

    if (!title || !courseId) {
      return res.status(400).json({ success: false, message: 'Title and course ID are required' });
    }

    // Verify course
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let videoData = {
      title,
      courseId,
      folderId: folderId || null,
      uploadedById: req.user.id,
    };

    if (type === 'youtube') {
      // YouTube video
      if (!youtubeUrl) {
        return res.status(400).json({ success: false, message: 'YouTube URL is required' });
      }

      // Extract video ID from various YouTube URL formats
      const videoId = extractYouTubeId(youtubeUrl);
      if (!videoId) {
        return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
      }

      videoData.type = 'youtube';
      videoData.youtubeUrl = youtubeUrl;
      videoData.storageUrl = `https://www.youtube.com/embed/${videoId}`;
    } else {
      // Direct video upload
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Video file is required for upload type' });
      }

      const storage = getStorageService();
      const folderPath = `learnnest/videos/${courseId}`;
      const result = await storage.uploadVideo(req.file, folderPath);

      videoData.type = 'upload';
      videoData.storageUrl = result.url;
      videoData.storagePublicId = result.publicId;
      videoData.duration = result.duration;
    }

    const video = await prisma.video.create({
      data: videoData,
      include: {
        uploadedBy: { select: { firstname: true, lastname: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Video added successfully', data: video });
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ success: false, message: 'Error creating video', error: error.message });
  }
};

// @desc    Get videos for a course/folder
// @route   GET /api/videos?courseId=xxx&folderId=xxx
// @access  Teacher, Institution Admin, Student
export const getVideos = async (req, res) => {
  try {
    const { courseId, folderId } = req.query;

    const where = {};
    if (courseId) where.courseId = courseId;
    if (folderId) where.folderId = folderId;

    const videos = await prisma.video.findMany({
      where,
      include: {
        uploadedBy: { select: { firstname: true, lastname: true } },
        folder: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: videos.length, data: videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ success: false, message: 'Error fetching videos', error: error.message });
  }
};

// @desc    Get single video by ID
// @route   GET /api/videos/:id
// @access  Teacher, Institution Admin, Student
export const getVideoById = async (req, res) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      include: {
        uploadedBy: { select: { firstname: true, lastname: true } },
        folder: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } }
      }
    });

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    res.status(200).json({ success: true, data: video });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ success: false, message: 'Error fetching video', error: error.message });
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Teacher, Institution Admin
export const deleteVideo = async (req, res) => {
  try {
    const video = await prisma.video.findUnique({ where: { id: req.params.id } });
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // If it's an uploaded video, delete from storage
    if (video.type === 'upload' && video.storagePublicId) {
      try {
        const storage = getStorageService();
        await storage.deleteVideo(video.storagePublicId);
      } catch (storageError) {
        console.error('Storage delete error (continuing):', storageError.message);
      }
    }

    await prisma.video.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ success: false, message: 'Error deleting video', error: error.message });
  }
};

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
