import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus } from '../../core/models/order.model';

type AccountSection = 'dashboard' | 'orders' | 'wishlist' | 'addresses' | 'payment' | 'security' | 'settings';

// Fallback data uses backend lowercase status values
const FALLBACK_ORDERS: Order[] = [
  {
    _id: '1',
    user: 'me',
    items: [],
    shippingAddress: { street: '', city: '', country: '', postalCode: '' },
    paymentInfo: { method: 'card', paid: true },
    totalPrice: 1250,
    status: 'delivered',
    createdAt: '2024-10-24'
  },
  {
    _id: '2',
    user: 'me',
    items: [],
    shippingAddress: { street: '', city: '', country: '', postalCode: '' },
    paymentInfo: { method: 'card', paid: true },
    totalPrice: 4300,
    status: 'processing',
    createdAt: '2024-10-18'
  },
  {
    _id: '3',
    user: 'me',
    items: [],
    shippingAddress: { street: '', city: '', country: '', postalCode: '' },
    paymentInfo: { method: 'card', paid: true },
    totalPrice: 890,
    status: 'delivered',
    createdAt: '2024-09-30'
  }
];

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account.html'
})
export class Account implements OnInit {
  private readonly auth         = inject(AuthService);
  private readonly orderService = inject(OrderService);

  readonly currentUser    = this.auth.currentUser;
  readonly activeSection  = signal<AccountSection>('orders');
  readonly orders         = signal<Order[]>(FALLBACK_ORDERS);
  readonly loading        = signal(true);
  readonly ctfPanelVisible = signal(true);
  readonly revalidating   = signal(false);

  ngOnInit(): void {
    // GET /api/v1/orders  → { success, orders: [...] }
    this.orderService
      .getMyOrders()
      .pipe(catchError(() => of(null)))
      .subscribe((orders) => {
        if (orders && orders.length) this.orders.set(orders);
        this.loading.set(false);
      });
  }

  setSection(section: AccountSection): void {
    this.activeSection.set(section);
  }

  dismissCtfPanel(): void {
    this.ctfPanelVisible.set(false);
  }

  revalidateSession(): void {
    this.revalidating.set(true);
    setTimeout(() => this.revalidating.set(false), 1200);
  }

  // Backend returns lowercase status: pending, processing, shipped, delivered, cancelled
  statusClasses(status: OrderStatus): string {
    switch (status) {
      case 'delivered':  return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped':    return 'bg-purple-100 text-purple-800';
      case 'cancelled':  return 'bg-red-100 text-red-800';
      default:           return 'bg-surface-container-highest text-on-surface-variant';
    }
  }

  statusDotClasses(status: OrderStatus): string {
    switch (status) {
      case 'delivered':  return 'bg-green-600';
      case 'processing': return 'bg-blue-600';
      case 'shipped':    return 'bg-purple-600';
      case 'cancelled':  return 'bg-red-600';
      default:           return 'bg-outline';
    }
  }

  /** Capitalize status for display */
  statusLabel(status: OrderStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
