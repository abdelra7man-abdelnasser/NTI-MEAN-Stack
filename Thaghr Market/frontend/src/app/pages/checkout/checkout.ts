import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './checkout.html'
})
export class Checkout {
  private readonly fb           = inject(FormBuilder);
  private readonly cartService  = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router       = inject(Router);

  readonly items    = this.cartService.items;
  readonly subtotal = this.cartService.subtotal;
  readonly shipping = this.cartService.shipping;
  readonly tax      = this.cartService.tax;
  readonly total    = this.cartService.total;

  readonly placingOrder  = signal(false);
  readonly orderPlaced   = signal(false);
  readonly errorMessage  = signal<string | null>(null);
  promoCode = '';   // plain string for ngModel

  // Backend requires: street, city, country, postalCode
  // Original form had: firstName, lastName, addressLine, phone (frontend-only UX fields)
  readonly shippingForm = this.fb.nonNullable.group({
    firstName:   ['', Validators.required],
    lastName:    ['', Validators.required],
    addressLine: ['', Validators.required],   // → mapped to "street"
    city:        ['', Validators.required],
    country:     ['EG', Validators.required], // default country
    postalCode:  ['', Validators.required],
    phone:       ['', Validators.required],
  });

  readonly paymentForm = this.fb.nonNullable.group({
    cardNumber: ['', [Validators.required, Validators.minLength(16)]],
    expiry:     ['', Validators.required],
    cvv:        ['', [Validators.required, Validators.minLength(3)]],
    saveCard:   [false],
  });

  productOf(item: { product: Product | string }): Product | null {
    return typeof item.product === 'string' ? null : item.product;
  }

  placeOrder(): void {
    this.shippingForm.markAllAsTouched();
    this.paymentForm.markAllAsTouched();
    if (this.shippingForm.invalid || this.paymentForm.invalid) return;

    this.placingOrder.set(true);
    this.errorMessage.set(null);

    const sf = this.shippingForm.getRawValue();

    // Map frontend form fields → backend expected shape
    this.orderService
      .create({
        shippingAddress: {
          street:     `${sf.firstName} ${sf.lastName}, ${sf.addressLine}`,
          city:       sf.city,
          country:    sf.country,
          postalCode: sf.postalCode,
        },
        paymentMethod: 'card',
      })
      .subscribe({
        next: () => {
          this.placingOrder.set(false);
          this.orderPlaced.set(true);
          this.cartService.clear();
          setTimeout(() => this.router.navigate(['/account']), 1500);
        },
        error: (err) => {
          this.placingOrder.set(false);
          this.errorMessage.set(
            err?.error?.message ?? 'Unable to place order. Please try again.'
          );
        },
      });
  }
}
