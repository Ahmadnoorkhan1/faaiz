export type ConsultantStatus = 
  | 'PENDING_REVIEW'
  | 'INTERVIEW_INVITED'
  | 'INTERVIEW_SCHEDULED'
  | 'REJECTED'
  | 'APPROVED';

export interface Consultant {
  id: string;
  userId: string;
  email: string;
  contactFirstName: string;
  contactLastName: string;
  phone: string;
  organizationWebsite: string;
  industry: string;
  position: string;
  experience: string;
  dateOfBirth: string;
  certifications: string[];
  cvUrl: string;
  servicesOffered: string[];
  otherDetails: string | null;
  profileCompleted: boolean;
  status: ConsultantStatus;
  interviewScore: number | null;
  reviewNotes: string | null;
  interviewDate: string | null;
  isAllowedToLogin: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}