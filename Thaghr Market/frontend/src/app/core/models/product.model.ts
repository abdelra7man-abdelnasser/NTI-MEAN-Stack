export interface ProductImage {
  url: string;
  alt?: string;
}

export interface Product {
  _id: string;
  title: string;
  brand?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  category: string | { _id: string; name: string };
  stock?: number;
  imageUrl?: string;
  images: ProductImage[];      // always guaranteed — normalized on load
  rating?: number;
  reviewCount?: number;        // frontend alias for reviews.length
  reviews?: any[];
  badge?: string;
  createdAt?: string;
}

export interface ProductsResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  products: Product[];
}
