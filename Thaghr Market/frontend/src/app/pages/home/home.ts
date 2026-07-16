import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

const CATEGORY_ICONS: Record<string, string> = {
  electronics: 'devices',
  clothing:    'apparel',
  books:       'menu_book',
  home:        'home_app_logo',
  accessories: 'watch',
  jewelry:     'diamond',
  sports:      'fitness_center',
  beauty:      'face',
  toys:        'toys',
};

interface CategoryDisplay {
  _id: string;
  name: string;
  icon: string;
}

const placeholder = (text: string) =>
  `https://placehold.co/400x400?text=${encodeURIComponent(text)}`;

const normalize = (p: Product): Product => {
  if (!p.images || p.images.length === 0) {
    p.images = [{ url: p.imageUrl ?? placeholder(p.title) }];
  }
  return p;
};

const FALLBACK_PRODUCTS: Product[] = [
  {
    _id: 'p1', title: 'SoundPro Elite Wireless Headphones', brand: 'Audio Specialists',
    price: 299, compareAtPrice: 499, rating: 4.9, badge: '-40%',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' }],
    category: 'electronics'
  },
  {
    _id: 'p2', title: 'Skeleton Automatic Mechanical Timepiece', brand: 'Chronos Luxe',
    price: 1250, rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80',
    images: [{ url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80' }],
    category: 'accessories'
  },
  {
    _id: 'p3', title: 'OmniVoice Gen 4 Smart Assistant', brand: 'SmartHome Co.',
    price: 189, compareAtPrice: 249, rating: 4.7, badge: 'BESTSELLER',
    imageUrl: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&q=80',
    images: [{ url: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&q=80' }],
    category: 'home'
  },
  {
    _id: 'p4', title: 'Apex Carbon Fiber Racing Bike', brand: 'Velocita',
    price: 4200, rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80',
    images: [{ url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80' }],
    category: 'sports'
  },
];

const FALLBACK_CATEGORIES: CategoryDisplay[] = [
  { _id: '1', name: 'Electronics',  icon: 'devices' },
  { _id: '2', name: 'Clothing',     icon: 'apparel' },
  { _id: '3', name: 'Books',        icon: 'menu_book' },
  { _id: '4', name: 'Home',         icon: 'home_app_logo' },
  { _id: '5', name: 'Accessories',  icon: 'watch' },
  { _id: '6', name: 'Jewelry',      icon: 'diamond' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  readonly categories     = signal<CategoryDisplay[]>(FALLBACK_CATEGORIES);
  readonly deals          = signal<Product[]>(FALLBACK_PRODUCTS);
  readonly loading        = signal(true);
  readonly searchTerm     = signal('');
  readonly addedProductId = signal<string | null>(null);

  constructor(
    private productService:  ProductService,
    private categoryService: CategoryService,
    private cartService:     CartService,
    private route:           ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchTerm.set(params['search'] ?? '');
      this.loadProducts();
    });

    this.categoryService
      .getAll()
      .pipe(catchError(() => of([] as Category[])))
      .subscribe((cats) => {
        if (cats.length) {
          this.categories.set(
            cats.map((c) => ({
              _id:  c._id,
              name: c.name,
              icon: CATEGORY_ICONS[c.name.toLowerCase()] ?? 'category',
            }))
          );
        }
      });
  }

  private loadProducts(): void {
    this.loading.set(true);
    const term = this.searchTerm();

    if (term) {
      // GET /api/v1/products/search?q=term → Observable<Product[]>
      this.productService
        .search(term)
        .pipe(catchError(() => of([] as Product[])))
        .subscribe((products) => {
          if (products.length) this.deals.set(products.map(normalize));
          this.loading.set(false);
        });
    } else {
      // GET /api/v1/products → Observable<ProductsResponse>
      this.productService
        .getAll({ limit: 12 })
        .pipe(catchError(() => of(null)))
        .subscribe((res) => {
          if (res && res.products.length) {
            this.deals.set(res.products.map(normalize));
          }
          this.loading.set(false);
        });
    }
  }

  addToCart(product: Product): void {
    this.cartService.addLocal(product, 1);
    this.addedProductId.set(product._id);
    setTimeout(() => this.addedProductId.set(null), 1500);
  }

  discountPercent(product: Product): number | null {
    if (!product.compareAtPrice) return null;
    return Math.round(
      ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
    );
  }
}
