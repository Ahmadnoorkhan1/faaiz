import * as consultantService from '../services/consultantService.js';

/**
 * Get all consultant profiles
 * @route GET /api/consultants
 * @access Private/Admin
 */
export const getConsultantProfiles = async (req, res, next) => {
  try {
    const consultantProfiles = await consultantService.getAllConsultantProfiles();
    
    res.status(200).json({
      success: true,
      count: consultantProfiles.length,
      data: consultantProfiles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get consultant profile by ID
 * @route GET /api/consultants/:id
 * @access Private
 */
export const getConsultantProfileById = async (req, res, next) => {
  try {
    const consultantProfile = await consultantService.getConsultantProfileById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: consultantProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get consultant profile by user ID
 * @route GET /api/consultants/user/:userId
 * @access Private
 */
export const getConsultantProfileByUserId = async (req, res, next) => {
  try {
    const consultantProfile = await consultantService.getConsultantProfileByUserId(req.params.userId);
    
    res.status(200).json({
      success: true,
      data: consultantProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create consultant profile
 * @route POST /api/consultants
 * @access Public
 */
export const createConsultantProfile = async (req, res, next) => {
  try {
    // Direct consultant creation
    const consultantProfile = await consultantService.createConsultantProfile(req.body);
    
    res.status(201).json({
      success: true,
      data: consultantProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update consultant profile
 * @route PUT /api/consultants/:id
 * @access Private
 */
export const updateConsultantProfile = async (req, res, next) => {
  try {
    const consultantProfile = await consultantService.updateConsultantProfile(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      data: consultantProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update consultant onboarding status
 * @route PATCH /api/consultants/:id/onboarding
 * @access Private
 */
export const updateConsultantOnboardingStatus = async (req, res, next) => {
  try {
    const { onboardingStatus } = req.body;
    
    if (!onboardingStatus) {
      return res.status(400).json({
        success: false,
        message: 'Please provide onboarding status',
      });
    }
    
    const consultantProfile = await consultantService.updateConsultantOnboardingStatus(
      req.params.id,
      onboardingStatus
    );
    
    res.status(200).json({
      success: true,
      data: consultantProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete consultant profile
 * @route DELETE /api/consultants/:id
 * @access Private/Admin
 */
export const deleteConsultantProfile = async (req, res, next) => {
  try {
    const consultantProfile = await consultantService.deleteConsultantProfile(req.params.id);
    
    res.status(200).json({
      success: true,
      data: consultantProfile,
    });
  } catch (error) {
    next(error);
  }
}; 