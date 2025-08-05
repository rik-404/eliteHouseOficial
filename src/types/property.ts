export interface PropertyFormData {
  title: string;
  type: string;
  reference: string;
  location: string;
  city: string;
  uf: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  garage: string;
  price: string;
  description: string;
  featured: boolean;
  status: boolean;
  vendido: boolean;
  broker_id?: string | null;
  image_url?: string;
  additional_media?: Array<{
    url: string;
    type: string;
    thumbnail?: string;
  }>;
  created_at?: string;
}

export interface Property extends Omit<PropertyFormData, 'area' | 'bedrooms' | 'bathrooms' | 'garage' | 'price'> {
  id: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  price: number;
  created_at: string;
  updated_at: string;
}
