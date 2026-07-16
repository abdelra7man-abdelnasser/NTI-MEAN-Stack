import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html'
})
export class Cart {
  private readonly cartService = inject(CartService);

  readonly items = this.cartService.items;
  readonly subtotal = this.cartService.subtotal;
  readonly shipping = this.cartService.shipping;
  readonly tax = this.cartService.tax;
  readonly total = this.cartService.total;

  productOf(item: { product: Product | string }): Product | null {
    return typeof item.product === 'string' ? null : item.product;
  }

  remove(index: number): void {
    this.cartService.removeLocal(index);
  }
}
