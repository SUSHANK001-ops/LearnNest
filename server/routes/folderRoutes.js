import express from 'express';
import { createFolder, getFolders, getFolderById, updateFolder, deleteFolder, initDefaultFolders } from '../controllers/folderController.js';
import { verifyToken, requireAuth } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireAuth);

router.post('/', checkRole(['teacher', 'institution_admin']), createFolder);
router.get('/', checkRole(['teacher', 'institution_admin', 'student']), getFolders);
router.get('/:id', checkRole(['teacher', 'institution_admin', 'student']), getFolderById);
router.put('/:id', checkRole(['teacher', 'institution_admin']), updateFolder);
router.delete('/:id', checkRole(['teacher', 'institution_admin']), deleteFolder);
router.post('/init/:courseId', checkRole(['teacher', 'institution_admin']), initDefaultFolders);

export default router;
