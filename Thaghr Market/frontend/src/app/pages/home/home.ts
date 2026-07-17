import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService }     from '../../core/services/cart.service';
import { AuthService }     from '../../core/services/auth.service';
import { Product }   from '../../core/models/product.model';
import { Category }  from '../../core/models/category.model';

// picsum seed images for the 21 products sent
const SEED_IMAGES: Record<string, string> = {
  'iphone15':    'https://picsum.photos/seed/iphone15/500/500',
  's24':         'https://picsum.photos/seed/s24/500/500',
  'sonywh':      'https://picsum.photos/seed/sonywh/500/500',
  'dellxps':     'https://picsum.photos/seed/dellxps/500/500',
  'applewatch':  'https://picsum.photos/seed/applewatch/500/500',
  'airfryer':    'https://picsum.photos/seed/airfryer/500/500',
  'instantpot':  'https://picsum.photos/seed/instantpot/500/500',
  'dysonv15':    'https://picsum.photos/seed/dysonv15/500/500',
  'kitchenaid':  'https://picsum.photos/seed/kitchenaid/500/500',
  'cleancode':   'https://picsum.photos/seed/cleancode/500/500',
  'atomichabits':'https://picsum.photos/seed/atomichabits/500/500',
  'pragprog':    'https://picsum.photos/seed/pragprog/500/500',
  'deepwork':    'https://picsum.photos/seed/deepwork/500/500',
  'airmax270':   'https://picsum.photos/seed/airmax270/500/500',
  'levis501':    'https://picsum.photos/seed/levis501/500/500',
  'northface':   'https://picsum.photos/seed/northface/500/500',
  'yogamat':     'https://picsum.photos/seed/yogamat/500/500',
  'dumbbells':   'https://picsum.photos/seed/dumbbells/500/500',
  'tent':        'https://picsum.photos/seed/tent/500/500',
  'legofalcon':  'https://picsum.photos/seed/legofalcon/500/500',
  'catan':       'https://picsum.photos/seed/catan/500/500',
};

const CATEGORY_ICONS: Record<string, string> = {
  electronics: 'devices',
  kitchen:     'kitchen',
  books:       'menu_book',
  fashion:     'apparel',
  clothing:    'apparel',
  sports:      'fitness_center',
  toys:        'toys',
  accessories: 'watch',
  home:        'home_app_logo',
  beauty:      'face',
};

interface CategoryDisplay { _id: string; name: string; icon: string; }

export const normalize = (p: Product): Product => {
  if (!p.images || p.images.length === 0) {
    // Try to match seed key from imageUrl
    const seed = p.imageUrl?.match(/seed\/([^/]+)\//)?.[1];
    const url  = seed && SEED_IMAGES[seed]
      ? SEED_IMAGES[seed]
      : (p.imageUrl ?? `https://picsum.photos/seed/${p._id}/500/500`);
    p.images = [{ url }];
  }
  return p;
};

const FALLBACK_PRODUCTS: Product[] = [
  { _id:'p1', title:'iPhone 15 Pro', brand:'Apple', price:1199.99, rating:4.9, badge:'NEW',
    imageUrl:'https://picsum.photos/seed/iphone15/500/500',
    images:[{url:'https://picsum.photos/seed/iphone15/500/500'}], category:'electronics' },
  { _id:'p2', title:'Samsung Galaxy S24', brand:'Samsung', price:999.99, rating:4.8,
    imageUrl:'https://picsum.photos/seed/s24/500/500',
    images:[{url:'https://picsum.photos/seed/s24/500/500'}], category:'electronics' },
  { _id:'p3', title:'Sony WH-1000XM5', brand:'Sony', price:349.99, rating:4.7,
    imageUrl:'https://picsum.photos/seed/sonywh/500/500',
    images:[{url:'https://picsum.photos/seed/sonywh/500/500'}], category:'electronics' },
  { _id:'p4', title:'Adjustable Dumbbell Set', brand:'ProFit', price:299.00, rating:4.6,
    imageUrl:'https://picsum.photos/seed/dumbbells/500/500',
    images:[{url:'https://picsum.photos/seed/dumbbells/500/500'}], category:'sports' },
];

const FALLBACK_CATEGORIES: CategoryDisplay[] = [
  { _id:'1', name:'Electronics', icon:'devices' },
  { _id:'2', name:'Kitchen',     icon:'kitchen' },
  { _id:'3', name:'Books',       icon:'menu_book' },
  { _id:'4', name:'Fashion',     icon:'apparel' },
  { _id:'5', name:'Sports',      icon:'fitness_center' },
  { _id:'6', name:'Toys',        icon:'toys' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  readonly categories      = signal<CategoryDisplay[]>(FALLBACK_CATEGORIES);
  readonly deals           = signal<Product[]>(FALLBACK_PRODUCTS);
  readonly loading         = signal(true);
  readonly searchTerm      = signal('');
  readonly activeCategoryId = signal('');
  readonly addedProductId  = signal<string | null>(null);
  readonly isAdmin         = signal(false);

  constructor(
    private productService:  ProductService,
    private categoryService: CategoryService,
    private cartService:     CartService,
    private authService:     AuthService,
    private route:           ActivatedRoute,
    private router:          Router
  ) {}

  ngOnInit(): void {
    this.isAdmin.set(this.authService.currentUser()?.role === 'admin');

    // Load categories
    this.categoryService
      .getAll()
      .pipe(catchError(() => of([] as Category[])))
      .subscribe((cats) => {
        if (cats.length) {
          this.categories.set(cats.map((c) => ({
            _id:  c._id,
            name: c.name,
            icon: CATEGORY_ICONS[c.name.toLowerCase()] ?? 'category',
          })));
        }
      });

    // React to ?search= and ?category= query params
    this.route.queryParams.subscribe((params) => {
      this.searchTerm.set(params['search'] ?? '');
      this.activeCategoryId.set(params['category'] ?? '');
      this.loadProducts();
    });
  }

  private loadProducts(): void {
    this.loading.set(true);
    const term     = this.searchTerm();
    const catId    = this.activeCategoryId();

    if (term) {
      // Search: GET /api/v1/products/search?q=
      this.productService
        .search(term)
        .pipe(catchError(() => of([] as Product[])))
        .subscribe((products) => {
          this.deals.set(products.length ? products.map(normalize) : FALLBACK_PRODUCTS);
          this.loading.set(false);
        });
    } else if (catId) {
      // Filter by category: GET /api/v1/products/filter?category=
      this.productService
        .filter({ category: catId, limit: 20 })
        .pipe(catchError(() => of(null)))
        .subscribe((res) => {
          this.deals.set(res?.products?.length ? res.products.map(normalize) : FALLBACK_PRODUCTS);
          this.loading.set(false);
        });
    } else {
      // All products: GET /api/v1/products
      this.productService
        .getAll({ limit: 12 })
        .pipe(catchError(() => of(null)))
        .subscribe((res) => {
          this.deals.set(res?.products?.length ? res.products.map(normalize) : FALLBACK_PRODUCTS);
          this.loading.set(false);
        });
    }
  }

  filterByCategory(id: string): void {
    this.router.navigate(['/'], { queryParams: id ? { category: id } : {} });
  }

  addToCart(product: Product): void {
    this.cartService.addLocal(product, 1);
    this.addedProductId.set(product._id);
    setTimeout(() => this.addedProductId.set(null), 1500);
  }

  deleteProduct(id: string, event: Event): void {
    event.stopPropagation();
    if (!confirm('Delete this product?')) return;
    this.productService.delete(id).subscribe({
      next: () => this.deals.update((list) => list.filter((p) => p._id !== id)),
      error: (err) => alert(err?.error?.message ?? 'Failed to delete product'),
    });
  }

  discountPercent(product: Product): number | null {
    if (!product.compareAtPrice) return null;
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  }

  activeCategoryName(): string {
    const id = this.activeCategoryId();
    return this.categories().find((c) => c._id === id)?.name ?? '';
  }
}
