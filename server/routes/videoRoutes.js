import express from 'express';
import { createVideo, getVideos, getVideoById, deleteVideo } from '../controllers/videoController.js';
import { verifyToken, requireAuth } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleMiddleware.js';
import { uploadVideo as uploadVideoMiddleware, handleMulterError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireAuth);

// Video upload uses optional file upload (YouTube doesn't need a file)
router.post('/', checkRole(['teacher', 'institution_admin']), uploadVideoMiddleware.single('video'), handleMulterError, createVideo);
router.get('/', checkRole(['teacher', 'institution_admin', 'student']), getVideos);
router.get('/:id', checkRole(['teacher', 'institution_admin', 'student']), getVideoById);
router.delete('/:id', checkRole(['teacher', 'institution_admin']), deleteVideo);

export default router;
