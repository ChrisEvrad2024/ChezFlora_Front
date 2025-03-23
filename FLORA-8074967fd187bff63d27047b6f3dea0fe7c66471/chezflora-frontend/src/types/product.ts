
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock?: number;
  images: string[];
  category: string;
  popular: boolean;
  featured?: boolean;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}
