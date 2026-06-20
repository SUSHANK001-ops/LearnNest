import express from 'express';
import { signup, login, getAllAdmins, updateAdmin, deleteAdmin, exportAllAdmins, exportInstitutionAdmins, changePassword, createTeacherWithAccount, createStudentWithAccount, toggleUserStatus, resetUserPassword } from '../controller/authController.js';
import { verifyToken, requireAuth } from '../../middleware/auth.js';
import { checkRole } from '../../middleware/roleMiddleware.js';

const router = express.Router();

// Optional verifyToken: if Authorization header present it will populate req.user
router.post('/signup', verifyToken, signup);
router.post('/login', login);

// Change password (authenticated users)
router.post('/change-password', verifyToken, requireAuth, changePassword);

// Create teacher/student with login accounts (Institution Admin)
router.post('/create-teacher', verifyToken, requireAuth, checkRole(['institution_admin']), createTeacherWithAccount);
router.post('/create-student', verifyToken, requireAuth, checkRole(['institution_admin']), createStudentWithAccount);

// Toggle user active status (Institution Admin, SuperAdmin)
router.patch('/toggle-status/:id', verifyToken, requireAuth, checkRole(['institution_admin', 'superadmin']), toggleUserStatus);

// Reset user password (Institution Admin, SuperAdmin)
router.post('/reset-password/:id', verifyToken, requireAuth, checkRole(['institution_admin', 'superadmin']), resetUserPassword);

// SuperAdmin only - Admin management routes
router.get('/admins', verifyToken, requireAuth, checkRole(['superadmin']), getAllAdmins);
router.put('/admins/:id', verifyToken, requireAuth, checkRole(['superadmin']), updateAdmin);
router.delete('/admins/:id', verifyToken, requireAuth, checkRole(['superadmin']), deleteAdmin);

// Export routes - SuperAdmin only
router.get('/export/admins', verifyToken, requireAuth, checkRole(['superadmin']), exportAllAdmins);
router.get('/export/institution/:institutionId/admins', verifyToken, requireAuth, checkRole(['superadmin']), exportInstitutionAdmins);

export default router;
