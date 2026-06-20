import { prisma } from '../config/db.js';

// @desc    Create a new institution
// @route   POST /api/institutions
// @access  SuperAdmin only
export const createInstitution = async (req, res) => {
  try {
    const { name, email, address, domain } = req.body;

    // Validate required fields
    if (!name || !email || !address || !domain) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, address, domain'
      });
    }

    // Check if domain already exists
    const existingInstitution = await prisma.institution.findUnique({ where: { domain } });
    if (existingInstitution) {
      return res.status(400).json({
        success: false,
        message: 'An institution with this domain already exists'
      });
    }

    // Create new institution
    const institution = await prisma.institution.create({
      data: {
        name,
        email,
        address,
        domain,
        createdById: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Institution created successfully',
      data: institution
    });
  } catch (error) {
    console.error('Error creating institution:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating institution',
      error: error.message
    });
  }
};

// @desc    Get all institutions
// @route   GET /api/institutions
// @access  SuperAdmin only
export const getAllInstitutions = async (req, res) => {
  try {
    const institutions = await prisma.institution.findMany({
      include: {
        createdBy: {
          select: { firstname: true, lastname: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: institutions.length,
      data: institutions
    });
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching institutions',
      error: error.message
    });
  }
};

// @desc    Get single institution by ID
// @route   GET /api/institutions/:id
// @access  SuperAdmin only
export const getInstitutionById = async (req, res) => {
  try {
    const institution = await prisma.institution.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: {
          select: { firstname: true, lastname: true, email: true }
        }
      }
    });

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    res.status(200).json({
      success: true,
      data: institution
    });
  } catch (error) {
    console.error('Error fetching institution:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching institution',
      error: error.message
    });
  }
};

// @desc    Update institution
// @route   PUT /api/institutions/:id
// @access  SuperAdmin only
export const updateInstitution = async (req, res) => {
  try {
    const { name, email, address, domain } = req.body;

    // Check if institution exists
    const institution = await prisma.institution.findUnique({ where: { id: req.params.id } });
    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    // If domain is being updated, check if new domain already exists
    if (domain && domain !== institution.domain) {
      const existingInstitution = await prisma.institution.findUnique({ where: { domain } });
      if (existingInstitution) {
        return res.status(400).json({
          success: false,
          message: 'An institution with this domain already exists'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    if (domain) updateData.domain = domain;

    // Update institution
    const updatedInstitution = await prisma.institution.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: 'Institution updated successfully',
      data: updatedInstitution
    });
  } catch (error) {
    console.error('Error updating institution:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating institution',
      error: error.message
    });
  }
};

// @desc    Delete institution
// @route   DELETE /api/institutions/:id
// @access  SuperAdmin only
export const deleteInstitution = async (req, res) => {
  try {
    const institutionId = req.params.id;
    const institution = await prisma.institution.findUnique({ where: { id: institutionId } });

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    // Delete the institution and all related records in a transaction
    // to prevent foreign key constraint errors.
    await prisma.$transaction([
      prisma.course.deleteMany({ where: { institutionId } }),
      prisma.student.deleteMany({ where: { institutionId } }),
      prisma.teacher.deleteMany({ where: { institutionId } }),
      prisma.user.deleteMany({ where: { institutionId } }),
      prisma.institution.delete({ where: { id: institutionId } })
    ]);

    res.status(200).json({
      success: true,
      message: 'Institution deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting institution:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting institution',
      error: error.message
    });
  }
};

// @desc    Get my institution (for institution admin)
// @route   GET /api/institutions/my
// @access  Institution Admin
export const getMyInstitution = async (req, res) => {
  try {
    // Debug: Log the user object
    console.log('User object:', req.user);
    console.log('User institutionId:', req.user.institutionId);
    
    // Check if user has an institution assigned
    if (!req.user.institutionId) {
      return res.status(404).json({
        success: false,
        message: 'No institution assigned to this account. Please contact LearnNest Admin to assign an institution.'
      });
    }

    const institution = await prisma.institution.findUnique({
      where: { id: req.user.institutionId },
      include: {
        createdBy: {
          select: { firstname: true, lastname: true, email: true }
        }
      }
    });

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    res.status(200).json({
      success: true,
      data: institution
    });
  } catch (error) {
    console.error('Error fetching institution:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching institution',
      error: error.message
    });
  }
};
