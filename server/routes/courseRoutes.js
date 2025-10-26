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

// All routes require authentication and institution_admin role
router.use(verifyToken);
router.use(requireAuth);
router.use(checkRole(['institution_admin']));

router.post('/', createCourse);
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;
