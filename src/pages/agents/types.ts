export interface FAQ {
  question: string;
  answer: string;
}

export interface BasicTemplateFormData {
  companyName: string;
  country: string;
  industry: string;
  service: string;
  phone: string;
  website: string;
  offer: string;
  openingTimes: string;
  openingMessage: string;
  qualifiedProspect: string;
  model: string;
  faqs: FAQ[];
  setFormData: (updater: (prev: BasicTemplateFormData) => BasicTemplateFormData) => void;
}