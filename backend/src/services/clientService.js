import prisma from '../utils/prisma.js';
import bcrypt from 'bcryptjs';

/**
 * Create client profile with user
 * @param {Object} clientData - Client profile data
 * @returns {Object} Created client profile
 */
export const createClientProfile = async (clientData) => {
  try {
    // Extract user data
    const { 
      email, 
      password, 
      name, 
      services,
      ...otherClientData 
    } = clientData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Extract services from the services object
    const servicesData = services || {};

    // Create user and client profile in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user with CLIENT role
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'CLIENT',
        },
      });

      // Create client profile
      const clientProfile = await prisma.clientProfile.create({
        data: {
          userId: user.id,
          ...otherClientData,
          ...servicesData,
          onboardingStatus: 'IN_PROGRESS',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return clientProfile;
    });

    return result;
  } catch (error) {
    throw new Error(`Error creating client profile: ${error.message}`);
  }
};

/**
 * Get client profile by ID
 * @param {string} id - Client profile ID
 * @returns {Object} Client profile
 */
export const getClientProfileById = async (id) => {
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, role: true } } },
  });

  if (!clientProfile) {
    throw new Error('Client profile not found');
  }

  return clientProfile;
};

/**
 * Get client profile by user ID
 * @param {string} userId - User ID
 * @returns {Object} Client profile
 */
export const getClientProfileByUserId = async (userId) => {
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId },
  });

  if (!clientProfile) {
    throw new Error('Client profile not found');
  }

  return clientProfile;
};

/**
 * Update client profile
 * @param {string} id - Client profile ID
 * @param {Object} clientData - Client profile data to update
 * @returns {Object} Updated client profile
 */
export const updateClientProfile = async (id, clientData) => {
  // First check if profile exists
  const existingProfile = await prisma.clientProfile.findUnique({
    where: { id },
  });

  if (!existingProfile) {
    throw new Error('Client profile not found');
  }

  // Prepare services data from form if present
  const {
    services,
    ...otherClientData
  } = clientData;

  // Extract services from the services object if present
  const servicesData = services || {};

  // Update client profile
  const updatedProfile = await prisma.clientProfile.update({
    where: { id },
    data: {
      ...otherClientData,
      ...servicesData,
    },
  });

  return updatedProfile;
};

/**
 * Update client onboarding status
 * @param {string} id - Client profile ID
 * @param {Object} data - Data containing currentStep and onboardingStatus
 * @returns {Object} Updated client profile
 */
export const updateClientOnboardingStatus = async (id, data) => {
  const { currentStep, onboardingStatus } = data;
  
  const clientProfile = await prisma.clientProfile.update({
    where: { id },
    data: {
      currentStep: currentStep !== undefined ? currentStep : undefined,
      onboardingStatus: onboardingStatus || undefined,
    },
  });

  return clientProfile;
};

/**
 * Delete client profile
 * @param {string} id - Client profile ID
 * @returns {Object} Deleted client profile
 */
export const deleteClientProfile = async (id) => {
  // First check if profile exists
  const existingProfile = await prisma.clientProfile.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!existingProfile) {
    throw new Error('Client profile not found');
  }

  // Use transaction to delete both profile and user
  const result = await prisma.$transaction(async (prisma) => {
    // Delete client profile
    const deletedProfile = await prisma.clientProfile.delete({
      where: { id },
    });

    // Delete associated user
    if (existingProfile.userId) {
      await prisma.user.delete({
        where: { id: existingProfile.userId },
      });
    }

    return deletedProfile;
  });

  return result;
};

/**
 * Get all client profiles
 * @returns {Array} List of client profiles
 */
export const getAllClientProfiles = async () => {
  const clientProfiles = await prisma.clientProfile.findMany({
    include: { user: { select: { id: true, email: true, role: true } } },
  });

  return clientProfiles;
}; 