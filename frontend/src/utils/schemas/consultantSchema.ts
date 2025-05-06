import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const urlRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(:\d+)?(\/\S*)?$/;



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

// Validation schema for consultant onboarding form
export const consultantSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email address'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex, 'Password must contain at least one letter and one number'),
  
  organizationWebsite: z
    .string()
    .trim()
    .min(1, 'Organization website is required')
    .regex(urlRegex, 'Must be a valid URL')
    .transform((val) => {
      // Add https:// if not present
      if (!val.startsWith('http://') && !val.startsWith('https://')) {
        return `https://${val}`;
      }
      return val;
    }),
  
  contactFirstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  
  contactLastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Invalid phone number format'),
  
  industry: z
    .string()
    .trim()
    .min(1, 'Industry is required'),
  
  position: z
    .string()
    .trim()
    .min(1, 'Position is required')
    .max(100, 'Position must be less than 100 characters'),
  
  experience: z
    .string()
    .trim()
    .min(1, 'Years of experience is required'),
  
  dateOfBirth: z
    .string()
    .trim()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, {
      message: 'Invalid date format',
    })
    .refine((date) => {
      const parsedDate = new Date(date);
      const today = new Date();
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      return parsedDate <= eighteenYearsAgo;
    }, {
      message: 'Must be at least 18 years old',
    }),

  certifications: z.array(z.string()).default([]),
  cvUrl: z.string().regex(urlRegex, 'Must be a valid URL').optional(),
  
  servicesOffered: z.array(ServiceType).default([]),
  otherDetails: z.string().optional(),
  
  profileCompleted: z.boolean().default(false)
});

// Export the inferred type
export type ConsultantFormData = z.infer<typeof consultantSchema>;
export type ServiceTypeEnum = z.infer<typeof ServiceType>; 