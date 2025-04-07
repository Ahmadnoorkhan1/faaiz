import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const servicesSchema = z.object({
  isoService: z.boolean(),
  testingServices: z.boolean(),
  riskAssessment: z.boolean(),
  businessImpactAnalysis: z.boolean(),
  privacyImpactAnalysis: z.boolean(),
  dataAssurance: z.boolean(),
  audit: z.boolean(),
  awarenessTraining: z.boolean(),
  tabletopExercise: z.boolean(),
  other: z.boolean(),
  otherDetails: z.string().optional(),
});

export const clientSchema = z.object({
  // Account Info
  email: z.string()
    .trim()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  
  // Step 1: Basic Info
  services: servicesSchema,
  
  // Step 2: Personal Info
  fullName: z.string().min(1, 'Full name is required'),
  phoneNumber: z.string().regex(phoneRegex, 'Please enter a valid phone number'),
  organization: z.string().min(1, 'Organization name is required'),
  additionalContact: z.string().optional(),
  
  // Step 3: Discovery
  discoveryMethod: z.enum(['call', 'form']),
  scopingDetails: z.object({
    // TODO: Add scoping form fields when provided
  }).optional(),
  
  // Step 5: Interview (Optional)
  interviewDate: z.string().optional(),
  interviewTime: z.string().optional(),
  
  // Step 6: Legal
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

export type ClientFormData = z.infer<typeof clientSchema>;
export type ServicesFormData = z.infer<typeof servicesSchema>; 