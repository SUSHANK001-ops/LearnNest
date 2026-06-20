import express from 'express';
import { getInstitutionAnalytics, getPlatformAnalytics } from '../controllers/analyticsController.js';
import { verifyToken, requireAuth } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireAuth);

router.get('/institution', checkRole(['institution_admin']), getInstitutionAnalytics);
router.get('/platform', checkRole(['superadmin']), getPlatformAnalytics);

export default router;
