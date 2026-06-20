import express from 'express';
const router = express.Router();
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse
} from '../controllers/courseController.js';

import { checkRole } from '../middleware/roleMiddleware.js';
import { verifyToken, requireAuth } from '../middleware/auth.js';

// All routes require authentication
router.use(verifyToken);
router.use(requireAuth);

// Admin and teacher can manage courses
router.post('/', checkRole(['institution_admin', 'teacher']), createCourse);
router.get('/', checkRole(['institution_admin', 'teacher', 'student']), getCourses);
router.get('/:id', checkRole(['institution_admin', 'teacher', 'student']), getCourseById);
router.put('/:id', checkRole(['institution_admin', 'teacher']), updateCourse);
router.delete('/:id', checkRole(['institution_admin']), deleteCourse);

export default router;
