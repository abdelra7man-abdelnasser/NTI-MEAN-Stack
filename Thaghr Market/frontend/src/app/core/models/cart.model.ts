import { Product } from './product.model';

export interface CartItem {
  _id?: string;
  product: Product | string;
  quantity: number;
  price: number;
  // variant removed — not a field in the backend model
}

export interface Cart {
  _id?: string;
  user?: string;
  items: CartItem[];
  totalPrice: number;
}
