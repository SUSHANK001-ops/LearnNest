import express from 'express';
import { uploadFile, getFiles, getFileById, deleteFile } from '../controllers/fileController.js';
import { verifyToken, requireAuth } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleMiddleware.js';
import { uploadDocument, handleMulterError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireAuth);

router.post('/', checkRole(['teacher', 'institution_admin']), uploadDocument.single('file'), handleMulterError, uploadFile);
router.get('/', checkRole(['teacher', 'institution_admin', 'student']), getFiles);
router.get('/:id', checkRole(['teacher', 'institution_admin', 'student']), getFileById);
router.delete('/:id', checkRole(['teacher', 'institution_admin']), deleteFile);

export default router;
