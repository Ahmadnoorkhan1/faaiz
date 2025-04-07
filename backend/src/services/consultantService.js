import prisma from '../utils/prisma.js';
import bcrypt from 'bcryptjs';

/**
 * Create consultant profile with user
 * @param {Object} consultantData - Consultant profile data
 * @returns {Object} Created consultant profile
 */
export const createConsultantProfile = async (consultantData) => {
  try {
    // Extract user data
    const { 
      email, 
      password, 
      name,
      ...otherConsultantData 
    } = consultantData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user and consultant profile in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user with CONSULTANT role
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'CONSULTANT',
        },
      });

      // Create consultant profile
      const consultantProfile = await prisma.consultantProfile.create({
        data: {
          userId: user.id,
          ...otherConsultantData,
          onboardingStatus: 'COMPLETED',
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

      return consultantProfile;
    });

    return result;
  } catch (error) {
    throw new Error(`Error creating consultant profile: ${error.message}`);
  }
};

/**
 * Get consultant profile by ID
 * @param {string} id - Consultant profile ID
 * @returns {Object} Consultant profile
 */
export const getConsultantProfileById = async (id) => {
  const consultantProfile = await prisma.consultantProfile.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, role: true } } },
  });

  if (!consultantProfile) {
    throw new Error('Consultant profile not found');
  }

  return consultantProfile;
};

/**
 * Get consultant profile by user ID
 * @param {string} userId - User ID
 * @returns {Object} Consultant profile
 */
export const getConsultantProfileByUserId = async (userId) => {
  const consultantProfile = await prisma.consultantProfile.findUnique({
    where: { userId },
  });

  if (!consultantProfile) {
    throw new Error('Consultant profile not found');
  }

  return consultantProfile;
};

/**
 * Update consultant profile
 * @param {string} id - Consultant profile ID
 * @param {Object} consultantData - Consultant profile data to update
 * @returns {Object} Updated consultant profile
 */
export const updateConsultantProfile = async (id, consultantData) => {
  // First check if profile exists
  const existingProfile = await prisma.consultantProfile.findUnique({
    where: { id },
  });

  if (!existingProfile) {
    throw new Error('Consultant profile not found');
  }

  // Update consultant profile
  const updatedProfile = await prisma.consultantProfile.update({
    where: { id },
    data: consultantData,
  });

  return updatedProfile;
};

/**
 * Update consultant onboarding status
 * @param {string} id - Consultant profile ID
 * @param {string} onboardingStatus - New onboarding status
 * @returns {Object} Updated consultant profile
 */
export const updateConsultantOnboardingStatus = async (id, onboardingStatus) => {
  const consultantProfile = await prisma.consultantProfile.update({
    where: { id },
    data: { onboardingStatus },
  });

  return consultantProfile;
};

/**
 * Delete consultant profile
 * @param {string} id - Consultant profile ID
 * @returns {Object} Deleted consultant profile
 */
export const deleteConsultantProfile = async (id) => {
  // First check if profile exists
  const existingProfile = await prisma.consultantProfile.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!existingProfile) {
    throw new Error('Consultant profile not found');
  }

  // Use transaction to delete both profile and user
  const result = await prisma.$transaction(async (prisma) => {
    // Delete consultant profile
    const deletedProfile = await prisma.consultantProfile.delete({
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
 * Get all consultant profiles
 * @returns {Array} List of consultant profiles
 */
export const getAllConsultantProfiles = async () => {
  const consultantProfiles = await prisma.consultantProfile.findMany({
    include: { user: { select: { id: true, email: true, role: true } } },
  });

  return consultantProfiles;
}; 