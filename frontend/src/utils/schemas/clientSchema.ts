import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const ServiceType = z.enum([
  'ISO_SERVICE',
  'TESTING_SERVICES',
  'RISK_ASSESSMENT',
  'BUSINESS_IMPACT_ANALYSIS',
  'PRIVACY_IMPACT_ANALYSIS',
  'DATA_ASSURANCE',
  'AUDIT',
  'AWARENESS_TRAINING',
  'TABLETOP_EXERCISE',
  'OTHER'
]);

export const clientSchema = z.object({
  // Account Info
  email: z.string()
    .trim()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  
  // Step 1: Basic Info
  serviceId: z.array(z.string()).min(1, "Please select at least one service"),
  otherDetails: z.string().optional(),
  
  // Step 2: Personal Info
  fullName: z.string().min(1, 'Full name is required'),
  phoneNumber: z.string().regex(phoneRegex, 'Please enter a valid phone number'),
  organization: z.string().min(1, 'Organization name is required'),
  additionalContact: z.string().optional(),
  
  // Step 3: Discovery
  discoveryMethod: z.enum(['call', 'form']).optional(),
  scopingDetails: z.record(z.any()).optional(),
  
  // Step 5: Interview (Optional)
  interviewDate: z.string().optional(),
  interviewTime: z.string().optional(),
  
  // Step 6: Legal
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

export type ClientFormData = z.infer<typeof clientSchema>; 