import express from 'express';
import { bulkImportStudents, bulkImportTeachers, bulkImportMCQs, bulkEnroll } from '../controllers/bulkImportController.js';
import { verifyToken, requireAuth } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleMiddleware.js';
import { uploadImport, handleMulterError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireAuth);

router.post('/students', checkRole(['institution_admin']), uploadImport.single('file'), handleMulterError, bulkImportStudents);
router.post('/teachers', checkRole(['institution_admin']), uploadImport.single('file'), handleMulterError, bulkImportTeachers);
router.post('/mcqs/:quizId', checkRole(['teacher', 'institution_admin']), uploadImport.single('file'), handleMulterError, bulkImportMCQs);
router.post('/enrollments', checkRole(['institution_admin']), uploadImport.single('file'), handleMulterError, bulkEnroll);

export default router;
