import { prisma } from '../config/db.js';

// @desc    Create a notification
// @route   POST /api/notifications
// @access  Teacher, Institution Admin
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, recipientId, courseId, recipientIds } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({ success: false, message: 'Title, message, and type are required' });
    }

    // Broadcast to multiple recipients
    if (recipientIds && Array.isArray(recipientIds) && recipientIds.length > 0) {
      const notifications = await prisma.notification.createMany({
        data: recipientIds.map(rid => ({
          title,
          message,
          type,
          recipientId: rid,
          institutionId: req.user.institutionId || null,
          courseId: courseId || null
        }))
      });

      return res.status(201).json({
        success: true,
        message: `${notifications.count} notifications sent`,
        data: { count: notifications.count }
      });
    }

    // Single recipient
    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient ID is required' });
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        recipientId,
        institutionId: req.user.institutionId || null,
        courseId: courseId || null
      }
    });

    res.status(201).json({ success: true, message: 'Notification sent', data: notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Error creating notification', error: error.message });
  }
};

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  All authenticated users
export const getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { recipientId: req.user.id };
    if (unreadOnly === 'true') where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          course: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { recipientId: req.user.id, isRead: false } })
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  All authenticated users
export const markAsRead = async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.recipientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });

    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification:', error);
    res.status(500).json({ success: false, message: 'Error marking notification', error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  All authenticated users
export const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { recipientId: req.user.id, isRead: false },
      data: { isRead: true }
    });

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications:', error);
    res.status(500).json({ success: false, message: 'Error marking notifications', error: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  All authenticated users
export const deleteNotification = async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });

    if (!notification || notification.recipientId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await prisma.notification.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Error deleting notification', error: error.message });
  }
};

// @desc    Broadcast notification to all students in a course
// @route   POST /api/notifications/broadcast
// @access  Teacher, Institution Admin
export const broadcastToCourse = async (req, res) => {
  try {
    const { title, message, type, courseId } = req.body;

    if (!title || !message || !type || !courseId) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Get all students enrolled in the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        students: { select: { userId: true } }
      }
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const recipientIds = course.students
      .filter(s => s.userId)
      .map(s => s.userId);

    if (recipientIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No students enrolled in this course' });
    }

    const notifications = await prisma.notification.createMany({
      data: recipientIds.map(recipientId => ({
        title,
        message,
        type,
        recipientId,
        institutionId: req.user.institutionId || null,
        courseId
      }))
    });

    res.status(201).json({
      success: true,
      message: `Notification sent to ${notifications.count} students`,
      data: { count: notifications.count }
    });
  } catch (error) {
    console.error('Error broadcasting:', error);
    res.status(500).json({ success: false, message: 'Error broadcasting notification', error: error.message });
  }
};
