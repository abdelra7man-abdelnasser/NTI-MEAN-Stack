import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateOrderPayload, Order } from '../models/order.model';

interface OrderResponse  { success: boolean; order: Order; }
interface OrdersResponse { success: boolean; orders: Order[]; }

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/v1/orders
   * Payload: { shippingAddress: { street, city, country, postalCode }, paymentMethod }
   */
  create(payload: CreateOrderPayload): Observable<Order> {
    return this.http
      .post<OrderResponse>(this.apiUrl, payload)
      .pipe(map((res) => res.order));
  }

  /**
   * GET /api/v1/orders
   * Returns the logged-in user's order history
   */
  getMyOrders(): Observable<Order[]> {
    return this.http
      .get<OrdersResponse>(this.apiUrl)
      .pipe(map((res) => res.orders));
  }

  /**
   * GET /api/v1/orders/:id
   */
  getById(id: string): Observable<Order> {
    return this.http
      .get<OrderResponse>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.order));
  }

  /**
   * PATCH /api/v1/orders/:id/cancel
   */
  cancel(id: string): Observable<Order> {
    return this.http
      .patch<OrderResponse>(`${this.apiUrl}/${id}/cancel`, {})
      .pipe(map((res) => res.order));
  }
}
