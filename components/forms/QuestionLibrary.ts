export interface FormQuestion {
  id: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'checkbox' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For 'select' and 'checkbox' types
}

export type QuestionType = FormQuestion['type'];

export const QUESTION_TYPES: { type: QuestionType; label: string }[] = [
  { type: 'text', label: 'Short answer' },
  { type: 'textarea', label: 'Paragraph' },
  { type: 'select', label: 'Dropdown' },
  { type: 'checkbox', label: 'Checkboxes' },
  { type: 'date', label: 'Date' },
  { type: 'email', label: 'Email' },
  { type: 'phone', label: 'Phone' },
];
