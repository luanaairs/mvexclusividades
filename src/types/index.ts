export type Property = {
  id: string;
  agentName: string;
  propertyName: string;
  bedrooms: number;
  bathrooms: number;
  suites: number;
  areaSize: number;
  totalAreaSize?: number;
  price: number;
  paymentTerms: string;
  additionalFeatures: string;
  tags: string[];
};
