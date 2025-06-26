export type PropertyCategory = 'FRENTE' | 'LATERAL' | 'FUNDOS' | 'DECORADO' | 'MOBILIADO' | 'COM_VISTA_PARA_O_MAR';
export type PropertyType = 'CASA' | 'APARTAMENTO' | 'LOTE' | 'OUTRO';
export type PropertyStatus = 'DISPONIVEL' | 'NOVO_NA_SEMANA' | 'ALTERADO' | 'VENDIDO_NA_SEMANA' | 'VENDIDO_NO_MES';

export type Property = {
  id: string;
  agentName: string;
  propertyName: string;
  houseNumber: string;
  bedrooms: number;
  bathrooms: number;
  suites: number;
  lavabos: number;
  areaSize: number;
  totalAreaSize?: number;
  price: number;
  paymentTerms: string;
  additionalFeatures: string;
  tags: string[];
  category?: PropertyCategory;
  propertyType: PropertyType;
  status: PropertyStatus;
  brokerContact?: string;
  photoDriveLink?: string;
  extraMaterialLink?: string;
  address?: string;
  neighborhood?: string;
};
