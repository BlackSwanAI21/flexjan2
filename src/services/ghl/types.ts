export interface CustomValue {
  id: string;
  name: string;
  fieldKey: string;
  value?: string;
}

export interface UpdateCustomValuePayload {
  customValueId: string;
  value: string;
}