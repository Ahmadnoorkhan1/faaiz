import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

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
    .max(100, 'Password must be less than 100 characters'),
  
    
  organizationWebsite: z
    .string()
    .trim()
    .min(1, 'Organization website is required')
    .url('Must be a valid URL'),
  
  contactName: z
    .string()
    .trim()
    .min(1, 'Contact name is required')
    .max(100, 'Contact name must be less than 100 characters'),
  
  contactInfo: z
    .string()
    .trim()
    .min(1, 'Contact information is required')
    .regex(phoneRegex, 'Invalid phone number format')
    .max(100, 'Contact information must be less than 100 characters'),
  
  industry: z
    .string()
    .trim()
    .min(1, 'Industry is required'),
  
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  
  position: z
    .string()
    .trim()
    .min(1, 'Position is required')
    .max(100, 'Position must be less than 100 characters'),
  
  experience: z
    .string()
    .trim()
    .min(1, 'Years of experience is required')
    .refine((val) => !isNaN(Number(val)), {
      message: 'Experience must be a number',
    }),
  
  dateOfBirth: z
    .string()
    .trim()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      // Check if the date is valid
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, {
      message: 'Invalid date format',
    })
    .refine((date) => {
      // Check if the person is at least 18 years old
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
});

// Export the inferred type
export type ConsultantFormData = z.infer<typeof consultantSchema>; 