import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService }  from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { UserService }  from '../../core/services/user.service';
import { Order, OrderStatus } from '../../core/models/order.model';

type AccountSection = 'orders' | 'profile' | 'addresses';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './account.html'
})
export class Account implements OnInit {
  private readonly auth         = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly userService  = inject(UserService);
  private readonly fb           = inject(FormBuilder);

  readonly currentUser   = this.auth.currentUser;
  readonly activeSection = signal<AccountSection>('orders');
  readonly orders        = signal<Order[]>([]);
  readonly loading       = signal(true);
  readonly savingProfile = signal(false);
  readonly profileSaved  = signal(false);
  readonly profileError  = signal<string | null>(null);

  readonly profileForm = this.fb.nonNullable.group({
    name:  [this.currentUser()?.name ?? '', [Validators.required, Validators.minLength(2)]],
    email: [this.currentUser()?.email ?? '', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.orderService
      .getMyOrders()
      .pipe(catchError(() => of([] as Order[])))
      .subscribe((orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      });

    // Keep form in sync with latest user data
    const u = this.currentUser();
    if (u) {
      this.profileForm.patchValue({ name: u.name, email: u.email });
    }
  }

  setSection(s: AccountSection): void { this.activeSection.set(s); }

  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.savingProfile.set(true);
    this.profileError.set(null);
    this.userService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.profileSaved.set(true);
        setTimeout(() => this.profileSaved.set(false), 2500);
      },
      error: (err) => {
        this.savingProfile.set(false);
        this.profileError.set(err?.error?.message ?? 'Failed to update profile.');
      },
    });
  }

  statusClasses(s: OrderStatus): string {
    return { delivered:'bg-green-100 text-green-800', processing:'bg-blue-100 text-blue-800',
             shipped:'bg-purple-100 text-purple-800', cancelled:'bg-red-100 text-red-800',
             pending:'bg-yellow-100 text-yellow-800' }[s] ?? 'bg-surface-container-highest text-on-surface-variant';
  }

  statusDotClasses(s: OrderStatus): string {
    return { delivered:'bg-green-600', processing:'bg-blue-600', shipped:'bg-purple-600',
             cancelled:'bg-red-600', pending:'bg-yellow-500' }[s] ?? 'bg-outline';
  }

  statusLabel(s: OrderStatus): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
