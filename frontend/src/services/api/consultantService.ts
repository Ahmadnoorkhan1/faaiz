import api from './axios';

export interface ConsultantData {
  id?: string;
  userId?: string;
  email: string;
  password: string;
  name: string;
  organizationWebsite: string;
  contactName: string;
  contactInfo: string;
  industry: string;
  firstName: string;
  lastName: string;
  position: string;
  experience: string;
  dateOfBirth: string;
  onboardingStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create a new consultant profile directly with user creation
 */
export const createConsultant = async (data: Partial<ConsultantData>): Promise<ConsultantData> => {
  const response = await api.post('/consultants', data);
  return response.data.data;
};

/**
 * Get consultant by user ID
 */
export const getConsultantByUserId = async (userId: string): Promise<ConsultantData | null> => {
  try {
    const response = await api.get(`/consultants/user/${userId}`);
    return response.data.data;
  } catch (error) {
    if ((error as any)?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Get consultant by ID
 */
export const getConsultantById = async (id: string): Promise<ConsultantData> => {
  const response = await api.get(`/consultants/${id}`);
  return response.data.data;
};

/**
 * Update consultant profile
 */
export const updateConsultant = async (id: string, data: Partial<ConsultantData>): Promise<ConsultantData> => {
  const response = await api.put(`/consultants/${id}`, data);
  return response.data.data;
};

/**
 * Get all consultants
 */
export const getAllConsultants = async (): Promise<ConsultantData[]> => {
  const response = await api.get('/consultants');
  return response.data.data;
};

/**
 * Delete consultant profile
 */
export const deleteConsultant = async (id: string): Promise<void> => {
  await api.delete(`/consultants/${id}`);
};

/**
 * Update consultant onboarding status
 */
export const updateOnboardingStatus = async (id: string, status: string): Promise<ConsultantData> => {
  const response = await api.patch(`/consultants/${id}/onboarding`, { onboardingStatus: status });
  return response.data.data;
}; 