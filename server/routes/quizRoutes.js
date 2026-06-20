import express from 'express';
import {
  createQuiz, getQuizzes, getQuizById, updateQuiz, deleteQuiz,
  addQuestion, updateQuestion, deleteQuestion,
  startQuizAttempt, submitQuizAttempt, getMyAttempts, getAllAttempts
} from '../controllers/quizController.js';
import { verifyToken, requireAuth } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireAuth);

// Quiz CRUD (Teacher)
router.post('/', checkRole(['teacher', 'institution_admin']), createQuiz);
router.get('/', checkRole(['teacher', 'institution_admin', 'student']), getQuizzes);
router.get('/:id', checkRole(['teacher', 'institution_admin']), getQuizById);
router.put('/:id', checkRole(['teacher', 'institution_admin']), updateQuiz);
router.delete('/:id', checkRole(['teacher', 'institution_admin']), deleteQuiz);

// Question management (Teacher)
router.post('/:id/questions', checkRole(['teacher', 'institution_admin']), addQuestion);
router.put('/questions/:questionId', checkRole(['teacher', 'institution_admin']), updateQuestion);
router.delete('/questions/:questionId', checkRole(['teacher', 'institution_admin']), deleteQuestion);

// Quiz attempt (Student)
router.post('/:id/start', checkRole(['student']), startQuizAttempt);
router.post('/attempts/:attemptId/submit', checkRole(['student']), submitQuizAttempt);
router.get('/:id/attempts', checkRole(['student']), getMyAttempts);

// Teacher view of all attempts
router.get('/:id/all-attempts', checkRole(['teacher', 'institution_admin']), getAllAttempts);

export default router;
