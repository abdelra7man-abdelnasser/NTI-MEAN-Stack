import { CartItem } from './cart.model';

// Backend status values (lowercase)
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;        // backend field name
  status: OrderStatus;
  paymentInfo: {
    method: 'card' | 'cash';
    paid: boolean;
    paidAt?: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  createdAt: string;
}

// What we POST to /api/v1/orders
export interface CreateOrderPayload {
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: 'card' | 'cash';
}
