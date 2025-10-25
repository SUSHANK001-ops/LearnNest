import express from 'express';
const router = express.Router();
import {
  createInstitution,
  getAllInstitutions,
  getInstitutionById,
  updateInstitution,
  deleteInstitution,
  getMyInstitution
} from '../controllers/institutionController.js';

import { checkRole } from '../middleware/roleMiddleware.js';
import { verifyToken, requireAuth } from '../middleware/auth.js';

// All routes require authentication
router.use(verifyToken);
router.use(requireAuth);

// Institution Admin route - must come before /:id
router.get('/my', getMyInstitution);

// SuperAdmin routes
router.post('/', checkRole(['superadmin']), createInstitution);
router.get('/', checkRole(['superadmin']), getAllInstitutions);
router.get('/:id', checkRole(['superadmin']), getInstitutionById);
router.put('/:id', checkRole(['superadmin']), updateInstitution);
router.delete('/:id', checkRole(['superadmin']), deleteInstitution);

export default router;
