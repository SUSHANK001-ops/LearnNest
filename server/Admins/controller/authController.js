import { prisma } from '../../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES = '1d';

export const signup = async (req, res) => {
  try {
    const { fullname, username, email, password, role, institutionId } = req.body;
    if (!fullname || !username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (role === 'superadmin') {
      const existingSuper = await prisma.user.findFirst({ where: { role: 'superadmin' } });
      if (existingSuper) return res.status(403).json({ message: 'Superadmin already exists' });
    }

    if (role === 'institution_admin') {
      if (!req.user || req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Only superadmin can create institution admin' });
      }
      if (!institutionId) {
        return res.status(400).json({ message: 'Institution ID is required for institution admin' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Provide default firstname and lastname from fullname if it's passed as an object or split
    let firstname = '';
    let lastname = '';
    if (typeof fullname === 'object') {
        firstname = fullname.firstname;
        lastname = fullname.lastname || '';
    } else {
        firstname = fullname;
    }

    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        username,
        email,
        password: hashedPassword,
        role: role || 'institution_admin',
        institutionId: institutionId || null
      }
    });

    return res.status(201).json({ message: 'User created', userId: user.id });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') return res.status(400).json({ message: 'Email already exists' });
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        username: user.username, 
        role: user.role,
        isFirstLogin: user.isFirstLogin 
      } 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'institution_admin' },
      include: {
        institution: {
          select: { name: true, domain: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Remove passwords before returning
    const safeAdmins = admins.map(admin => {
        const { password, ...safe } = admin;
        return safe;
    });

    return res.status(200).json({ 
      success: true,
      data: safeAdmins 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, username, email, password, institutionId } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (user.role !== 'institution_admin') {
      return res.status(400).json({ message: 'Can only update institution admins' });
    }

    const updateData = {};
    if (fullname) {
        if (typeof fullname === 'object') {
            updateData.firstname = fullname.firstname;
            updateData.lastname = fullname.lastname || '';
        } else {
            updateData.firstname = fullname;
        }
    }
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (institutionId !== undefined) updateData.institutionId = institutionId || null;

    const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData
    });

    return res.status(200).json({ 
      success: true,
      message: 'Admin updated successfully',
      data: {
        id: updatedUser.id,
        fullname: { firstname: updatedUser.firstname, lastname: updatedUser.lastname },
        username: updatedUser.username,
        email: updatedUser.email,
        institutionId: updatedUser.institutionId
      }
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') return res.status(400).json({ message: 'Email already exists' });
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (user.role !== 'institution_admin') {
      return res.status(400).json({ message: 'Can only delete institution admins' });
    }

    await prisma.user.delete({ where: { id } });

    return res.status(200).json({ 
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const exportInstitutionAdmins = async (req, res) => {
  try {
    const { institutionId } = req.params;

    const admins = await prisma.user.findMany({
      where: { 
        role: 'institution_admin',
        institutionId: institutionId 
      },
      include: {
        institution: {
          select: { name: true, domain: true, email: true }
        }
      }
    });

    if (admins.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No admins found for this institution' 
      });
    }

    const exportData = admins.map(admin => ({
      institution: admin.institution?.name || 'N/A',
      domain: admin.institution?.domain || 'N/A',
      institutionEmail: admin.institution?.email || 'N/A',
      adminFirstName: admin.firstname || '',
      adminLastName: admin.lastname || '',
      username: admin.username,
      email: admin.email,
      passwordNote: 'HASHED - Generate temporary password',
      createdAt: admin.createdAt,
      lastUpdated: admin.updatedAt
    }));

    return res.status(200).json({
      success: true,
      data: exportData,
      timestamp: new Date().toISOString(),
      warning: 'This data contains sensitive information. Handle with care.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

export const exportAllAdmins = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'institution_admin' },
      include: {
        institution: {
          select: { id: true, name: true, domain: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const exportData = admins.map(admin => ({
      institution: admin.institution?.name || 'Not Assigned',
      domain: admin.institution?.domain || 'N/A',
      institutionEmail: admin.institution?.email || 'N/A',
      adminFirstName: admin.firstname || '',
      adminLastName: admin.lastname || '',
      username: admin.username,
      email: admin.email,
      passwordNote: 'HASHED - Cannot export. Generate temporary password.',
      createdAt: admin.createdAt,
      lastUpdated: admin.updatedAt,
      institutionId: admin.institution?.id || null
    }));

    return res.status(200).json({
      success: true,
      data: exportData,
      count: exportData.length,
      timestamp: new Date().toISOString(),
      warning: 'This data contains sensitive information. Handle with care.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, isFirstLogin: false }
    });

    return res.status(200).json({ 
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
