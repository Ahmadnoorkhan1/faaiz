import * as clientService from '../services/clientService.js';

/**
 * Get all client profiles
 * @route GET /api/clients
 * @access Private/Admin
 */
export const getClientProfiles = async (req, res, next) => {
  try {
    const clientProfiles = await clientService.getAllClientProfiles();
    
    res.status(200).json({
      success: true,
      count: clientProfiles.length,
      data: clientProfiles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get client profile by ID
 * @route GET /api/clients/:id
 * @access Private
 */
export const getClientProfileById = async (req, res, next) => {
  try {
    const clientProfile = await clientService.getClientProfileById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: clientProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get client profile by user ID
 * @route GET /api/clients/user/:userId
 * @access Private
 */
export const getClientProfileByUserId = async (req, res, next) => {
  try {
    const clientProfile = await clientService.getClientProfileByUserId(req.params.userId);
    
    res.status(200).json({
      success: true,
      data: clientProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create client profile
 * @route POST /api/clients
 * @access Public
 */
export const createClientProfile = async (req, res, next) => {
  try {
    // Direct client creation
    const clientProfile = await clientService.createClientProfile(req.body);
    
    res.status(201).json({
      success: true,
      data: clientProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update client profile
 * @route PUT /api/clients/:id
 * @access Private
 */
export const updateClientProfile = async (req, res, next) => {
  try {
    const clientProfile = await clientService.updateClientProfile(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      data: clientProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update client onboarding status
 * @route PATCH /api/clients/:id/onboarding
 * @access Private
 */
export const updateClientOnboardingStatus = async (req, res, next) => {
  try {
    const clientProfile = await clientService.updateClientOnboardingStatus(
      req.params.id,
      req.body
    );
    
    res.status(200).json({
      success: true,
      data: clientProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete client profile
 * @route DELETE /api/clients/:id
 * @access Private/Admin
 */
export const deleteClientProfile = async (req, res, next) => {
  try {
    const clientProfile = await clientService.deleteClientProfile(req.params.id);
    
    res.status(200).json({
      success: true,
      data: clientProfile,
    });
  } catch (error) {
    next(error);
  }
}; 