import Institution from '../models/Institution.js';

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
    const existingInstitution = await Institution.findOne({ domain });
    if (existingInstitution) {
      return res.status(400).json({
        success: false,
        message: 'An institution with this domain already exists'
      });
    }

    // Create new institution
    const institution = await Institution.create({
      name,
      email,
      address,
      domain,
      createdBy: req.user._id
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
    const institutions = await Institution.find()
      .populate('createdBy', 'fullname email')
      .sort({ createdAt: -1 });

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
    const institution = await Institution.findById(req.params.id)
      .populate('createdBy', 'fullname email');

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
    let institution = await Institution.findById(req.params.id);
    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    // If domain is being updated, check if new domain already exists
    if (domain && domain !== institution.domain) {
      const existingInstitution = await Institution.findOne({ domain });
      if (existingInstitution) {
        return res.status(400).json({
          success: false,
          message: 'An institution with this domain already exists'
        });
      }
    }

    // Update institution
    institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { name, email, address, domain, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Institution updated successfully',
      data: institution
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
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    await Institution.findByIdAndDelete(req.params.id);

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

    const institution = await Institution.findById(req.user.institutionId)
      .populate('createdBy', 'fullname email');

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
