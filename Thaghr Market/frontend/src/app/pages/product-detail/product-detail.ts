import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

const FALLBACK_PRODUCT: Product = {
  _id: 'fallback',
  title: 'Aether 7X Professional OLED Monitor',
  brand: 'Aether',
  price: 1299,
  rating: 4,
  description:
    'A 34-inch curved ultrawide OLED display engineered for creative professionals. Deep blacks, true-to-life color accuracy, and a razor-thin bezel.',
  stock: 12,
  category: 'Electronics',
  imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&q=80',
  images: [
    { url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&q=80', alt: 'Monitor on desk' },
    { url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80', alt: 'Stand detail' },
    { url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&q=80', alt: 'Ports' },
    { url: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&q=80', alt: 'Screen UI' },
  ]
};

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html'
})
export class ProductDetail implements OnInit {
  readonly product          = signal<Product>(FALLBACK_PRODUCT);
  readonly activeImageIndex = signal(0);
  readonly quantity         = signal(1);
  readonly addedToCart      = signal(false);
  readonly stars = [0, 1, 2, 3, 4];

  constructor(
    private route:          ActivatedRoute,
    private productService: ProductService,
    private cartService:    CartService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    // GET /api/v1/products/:id  → service unwraps { success, product }
    this.productService
      .getById(id)
      .pipe(catchError(() => of(null)))
      .subscribe((p) => {
        if (p) {
          // Normalize imageUrl → images array so template always works
          if (!p.images || p.images.length === 0) {
            p.images = p.imageUrl
              ? [{ url: p.imageUrl }]
              : [{ url: 'https://placehold.co/600x400?text=No+Image' }];
          }
          this.product.set(p);
        }
      });
  }

  selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  changeQuantity(delta: number): void {
    const max = this.product().stock ?? 99;
    this.quantity.update((q) => Math.min(max, Math.max(1, q + delta)));
  }

  addToCart(): void {
    this.cartService.addLocal(this.product(), this.quantity());
    this.addedToCart.set(true);
    setTimeout(() => this.addedToCart.set(false), 1800);
  }

  categoryName(): string {
    const cat = this.product().category;
    return typeof cat === 'string' ? cat : cat?.name ?? '';
  }
}
