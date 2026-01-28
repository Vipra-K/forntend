export interface FieldType {
  id: string;
  key: string;
  valueKind: string;
  hasOptions: boolean;
}

export interface Field {
  id: string;
  label: string;
  description: string;
  required: boolean;
  order: number;
  type: { key: string; id: string };
  options: { id: string; label: string; value: string }[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minValue?: number;
  maxValue?: number;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  slug: string;
  version: number;
  primaryColor: string;
  backgroundColor: string;
  buttonColor: string;
  textColor: string;
  fields: Field[];
  settings?: {
    id: string;
    maxSubmissions: number | null;
    allowMultipleSubmissions: boolean;
    openAt: string | null;
    closeAt: string | null;
    successMessage: string | null;
    redirectUrl: string | null;
  };
}
