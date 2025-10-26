import express from 'express';
const router = express.Router();
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  enrollStudentInCourse,
  unenrollStudentFromCourse
} from '../controllers/studentController.js';

import { checkRole } from '../middleware/roleMiddleware.js';
import { verifyToken, requireAuth } from '../middleware/auth.js';

// All routes require authentication and institution_admin role
router.use(verifyToken);
router.use(requireAuth);
router.use(checkRole(['institution_admin']));

router.post('/', createStudent);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);
router.patch('/:id/enroll', enrollStudentInCourse);
router.patch('/:id/unenroll', unenrollStudentFromCourse);

export default router;
