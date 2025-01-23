export interface FAQ {
  question: string;
  answer: string;
}

export interface ScrapedData {
  companyName: string;
  description: string;
  services: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  faqs?: FAQ[];
}

export interface WebScraperFormData {
  url: string;
  companyName: string;
  country: string;
  industry: string;
  service: string;
  phone: string;
  openingTimes: string;
  description: string;
  services: string[];
  openingMessage: string;
  qualifiedProspect: string;
  model: string;
  faqs: FAQ[];
}