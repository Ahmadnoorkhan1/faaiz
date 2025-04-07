import api from './axios';

export interface ClientData {
  id?: string;
  userId?: string;
  email: string;
  password: string;
  name: string;
  companyName: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  companySize?: string;
  requirementsAnalysis?: boolean;
  riskAssessment?: boolean;
  complianceManagement?: boolean;
  policyDevelopment?: boolean;
  trainingAndAwareness?: boolean;
  auditSupport?: boolean;
  currentStep?: number;
  onboardingStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  // Form-specific services fields
  services?: {
    isoService?: boolean;
    testingServices?: boolean;
    riskAssessment?: boolean;
    businessImpactAnalysis?: boolean;
    privacyImpactAnalysis?: boolean;
    dataAssurance?: boolean;
    audit?: boolean;
    awarenessTraining?: boolean;
    tabletopExercise?: boolean;
    other?: boolean;
    otherDetails?: string;
  };
  fullName?: string;
  phoneNumber?: string;
  organization?: string;
  additionalContact?: string;
  discoveryMethod?: string;
  interviewDate?: string;
  interviewTime?: string;
  termsAccepted?: boolean;
}

// Interface for client profile
export interface ClientProfile {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  organization: string;
  additionalContact?: string;
  isoService: boolean;
  testingServices: boolean;
  riskAssessment: boolean;
  businessImpactAnalysis: boolean;
  privacyImpactAnalysis: boolean;
  dataAssurance: boolean;
  audit: boolean;
  awarenessTraining: boolean;
  tabletopExercise: boolean;
  other: boolean;
  otherDetails?: string;
  discoveryMethod?: string;
  scopingDetails?: any;
  interviewDate?: string;
  interviewTime?: string;
  termsAccepted: boolean;
  currentStep: number;
  onboardingStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a client profile directly with user creation
 */
export const createClient = async (data: Partial<ClientData>): Promise<ClientData> => {
  const response = await api.post('/clients', data);
  return response.data.data;
};

/**
 * Get client by user ID
 */
export const getClientByUserId = async (userId: string): Promise<ClientData | null> => {
  try {
    const response = await api.get(`/clients/user/${userId}`);
    return response.data.data;
  } catch (error) {
    if ((error as any)?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Get client by ID
 */
export const getClientById = async (id: string): Promise<ClientData> => {
  const response = await api.get(`/clients/${id}`);
  return response.data.data;
};

/**
 * Update client profile
 */
export const updateClient = async (id: string, data: Partial<ClientData>): Promise<ClientData> => {
  const response = await api.put(`/clients/${id}`, data);
  return response.data.data;
};

/**
 * Update client onboarding step
 */
export const updateClientOnboarding = async (
  id: string,
  data: { currentStep?: number; onboardingStatus?: string }
): Promise<ClientData> => {
  const response = await api.patch(`/clients/${id}/onboarding`, data);
  return response.data.data;
};

/**
 * Get all clients
 */
export const getAllClients = async (): Promise<ClientData[]> => {
  const response = await api.get('/clients');
  return response.data.data;
};

/**
 * Delete client
 */
export const deleteClient = async (id: string): Promise<void> => {
  await api.delete(`/clients/${id}`);
}; 