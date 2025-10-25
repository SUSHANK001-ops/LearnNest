import express from 'express';
import { signup, login, getAllAdmins, updateAdmin, deleteAdmin, exportAllAdmins, exportInstitutionAdmins, changePassword } from '../controller/authController.js';
import { verifyToken, requireAuth } from '../../middleware/auth.js';
import { checkRole } from '../../middleware/roleMiddleware.js';

const router = express.Router();

// Optional verifyToken: if Authorization header present it will populate req.user
router.post('/signup', verifyToken, signup);
router.post('/login', login);

// Change password (authenticated users)
router.post('/change-password', verifyToken, requireAuth, changePassword);

// SuperAdmin only - Admin management routes
router.get('/admins', verifyToken, requireAuth, checkRole(['superadmin']), getAllAdmins);
router.put('/admins/:id', verifyToken, requireAuth, checkRole(['superadmin']), updateAdmin);
router.delete('/admins/:id', verifyToken, requireAuth, checkRole(['superadmin']), deleteAdmin);

// Export routes - SuperAdmin only
router.get('/export/admins', verifyToken, requireAuth, checkRole(['superadmin']), exportAllAdmins);
router.get('/export/institution/:institutionId/admins', verifyToken, requireAuth, checkRole(['superadmin']), exportInstitutionAdmins);

export default router;
