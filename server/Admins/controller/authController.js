import User from '../models/user.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES = '1d';

export const signup = async (req, res) => {
  try {
    const { fullname, username, email, password, role, institutionId } = req.body;
    if (!fullname || !username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // If creating a superadmin, ensure only one exists
    if (role === 'superadmin') {
      const existingSuper = await User.findOne({ role: 'superadmin' });
      if (existingSuper) return res.status(403).json({ message: 'Superadmin already exists' });
    }

    // If creating institution_admin, require that the requester is a superadmin
    if (role === 'institution_admin') {
      if (!req.user || req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Only superadmin can create institution admin' });
      }
      // Require institutionId for institution_admin
      if (!institutionId) {
        return res.status(400).json({ message: 'Institution ID is required for institution admin' });
      }
    }

    const user = new User({ 
      fullname, 
      username, 
      email, 
      password, 
      role: role || 'institution_admin',
      institutionId: institutionId || null
    });
    await user.save();
    return res.status(201).json({ message: 'User created', userId: user._id });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(400).json({ message: 'Email already exists' });
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.json({ 
      token, 
      user: { 
        id: user._id, 
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

// Get all institution admins (SuperAdmin only)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'institution_admin' })
      .populate('institutionId', 'name domain')
      .select('-password')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({ 
      success: true,
      data: admins 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update admin (SuperAdmin only)
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, username, email, password, institutionId } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (user.role !== 'institution_admin') {
      return res.status(400).json({ message: 'Can only update institution admins' });
    }

    // Update fields
    if (fullname) user.fullname = fullname;
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password; // Will be hashed by pre-save hook
    if (institutionId !== undefined) user.institutionId = institutionId || null;

    await user.save();

    return res.status(200).json({ 
      success: true,
      message: 'Admin updated successfully',
      data: {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        institutionId: user.institutionId
      }
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(400).json({ message: 'Email already exists' });
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete admin (SuperAdmin only)
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (user.role !== 'institution_admin') {
      return res.status(400).json({ message: 'Can only delete institution admins' });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({ 
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Export admin details for a specific institution (SuperAdmin only)
// WARNING: This includes sensitive data - use with caution
export const exportInstitutionAdmins = async (req, res) => {
  try {
    const { institutionId } = req.params;

    // Find all admins for this institution
    const admins = await User.find({ 
      role: 'institution_admin',
      institutionId: institutionId 
    })
    .populate('institutionId', 'name domain email')
    .select('-__v');

    if (admins.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No admins found for this institution' 
      });
    }

    // Format data for export
    const exportData = admins.map(admin => ({
      institution: admin.institutionId?.name || 'N/A',
      domain: admin.institutionId?.domain || 'N/A',
      institutionEmail: admin.institutionId?.email || 'N/A',
      adminFirstName: admin.fullname?.firstname || '',
      adminLastName: admin.fullname?.lastname || '',
      username: admin.username,
      email: admin.email,
      // Note: We cannot export the actual password as it's hashed
      // You should generate a temporary password and send it separately
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

// Export ALL admin details (SuperAdmin only)
// WARNING: This includes sensitive data - use with extreme caution
export const exportAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'institution_admin' })
      .populate('institutionId', 'name domain email')
      .select('-__v')
      .sort({ createdAt: -1 });

    // Format data for export
    const exportData = admins.map(admin => ({
      institution: admin.institutionId?.name || 'Not Assigned',
      domain: admin.institutionId?.domain || 'N/A',
      institutionEmail: admin.institutionId?.email || 'N/A',
      adminFirstName: admin.fullname?.firstname || '',
      adminLastName: admin.fullname?.lastname || '',
      username: admin.username,
      email: admin.email,
      passwordNote: 'HASHED - Cannot export. Generate temporary password.',
      createdAt: admin.createdAt,
      lastUpdated: admin.updatedAt,
      institutionId: admin.institutionId?._id || null
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

// Change password (for first-time login)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const match = await user.comparePassword(currentPassword);
    if (!match) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password and set isFirstLogin to false
    user.password = newPassword; // Will be hashed by pre-save hook
    user.isFirstLogin = false;
    await user.save();

    return res.status(200).json({ 
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

