import { prisma } from '../config/db.js';

// @desc    Get institution analytics
// @route   GET /api/analytics/institution
// @access  Institution Admin
export const getInstitutionAnalytics = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;

    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      activeCourses,
      totalFiles,
      totalVideos,
      totalQuizzes,
      quizAttempts
    ] = await Promise.all([
      prisma.student.count({ where: { institutionId } }),
      prisma.teacher.count({ where: { institutionId } }),
      prisma.course.count({ where: { institutionId } }),
      prisma.course.count({ where: { institutionId, isArchived: false } }),
      prisma.file.count({ where: { course: { institutionId } } }),
      prisma.video.count({ where: { course: { institutionId } } }),
      prisma.quiz.count({ where: { course: { institutionId } } }),
      prisma.quizAttempt.count({ where: { quiz: { course: { institutionId } } } })
    ]);

    // Storage usage (sum of file sizes)
    const storageUsage = await prisma.file.aggregate({
      where: { course: { institutionId } },
      _sum: { size: true }
    });

    // Quiz statistics
    const quizStats = await prisma.quizAttempt.aggregate({
      where: { quiz: { course: { institutionId } }, status: 'submitted' },
      _avg: { score: true },
      _count: true
    });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentStudents = await prisma.student.count({
      where: { institutionId, createdAt: { gte: thirtyDaysAgo } }
    });

    const recentCourses = await prisma.course.count({
      where: { institutionId, createdAt: { gte: thirtyDaysAgo } }
    });

    // Monthly activity (files uploaded per month for last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyUploads = await prisma.file.groupBy({
      by: ['createdAt'],
      where: { course: { institutionId }, createdAt: { gte: sixMonthsAgo } },
      _count: true
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalTeachers,
          totalCourses,
          activeCourses,
          totalFiles,
          totalVideos,
          totalQuizzes,
          quizAttempts
        },
        storage: {
          totalBytes: storageUsage._sum.size || 0,
          totalMB: Math.round((storageUsage._sum.size || 0) / (1024 * 1024) * 100) / 100
        },
        quizStatistics: {
          totalAttempts: quizStats._count,
          averageScore: Math.round(quizStats._avg.score || 0)
        },
        recentActivity: {
          newStudents: recentStudents,
          newCourses: recentCourses
        }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Error fetching analytics', error: error.message });
  }
};

// @desc    Get platform-wide analytics (SuperAdmin)
// @route   GET /api/analytics/platform
// @access  SuperAdmin
export const getPlatformAnalytics = async (req, res) => {
  try {
    const [
      totalInstitutions,
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      totalQuizzes
    ] = await Promise.all([
      prisma.institution.count(),
      prisma.user.count(),
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.course.count(),
      prisma.quiz.count()
    ]);

    const storageUsage = await prisma.file.aggregate({
      _sum: { size: true }
    });

    // Institutions with counts
    const institutions = await prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        domain: true,
        _count: {
          select: { users: true, courses: true, students: true, teachers: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalInstitutions,
          totalUsers,
          totalStudents,
          totalTeachers,
          totalCourses,
          totalQuizzes
        },
        storage: {
          totalBytes: storageUsage._sum.size || 0,
          totalMB: Math.round((storageUsage._sum.size || 0) / (1024 * 1024) * 100) / 100
        },
        institutions
      }
    });
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    res.status(500).json({ success: false, message: 'Error fetching analytics', error: error.message });
  }
};
