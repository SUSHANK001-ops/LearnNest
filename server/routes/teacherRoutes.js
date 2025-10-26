import express from 'express';
const router = express.Router();
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  assignTeacherToCourse,
  unassignTeacherFromCourse
} from '../controllers/teacherController.js';

import { checkRole } from '../middleware/roleMiddleware.js';
import { verifyToken, requireAuth } from '../middleware/auth.js';

// All routes require authentication and institution_admin role
router.use(verifyToken);
router.use(requireAuth);
router.use(checkRole(['institution_admin']));

router.post('/', createTeacher);
router.get('/', getTeachers);
router.get('/:id', getTeacherById);
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);
router.patch('/:id/assign', assignTeacherToCourse);
router.patch('/:id/unassign', unassignTeacherFromCourse);

export default router;
