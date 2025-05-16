export interface Question {
  id: string;
  text: string;
  type: 'text' | 'radio' | 'checkbox';
  required: boolean;
  options?: string[];
}

export interface ScopingForm {
  id: string;
  service: string;
  questions: Question[];
  createdById: string;
  clientId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type FormViewMode = 'Table' | 'Add' | 'View' | 'Edit';