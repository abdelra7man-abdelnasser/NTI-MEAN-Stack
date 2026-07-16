import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

const LOCAL_CART_KEY = 'thaghr_cart';

interface CartResponse {
  success: boolean;
  cart: Cart;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/cart`;

  private readonly itemsSig = signal<CartItem[]>(this.readLocalCart());

  readonly items     = this.itemsSig.asReadonly();
  readonly itemCount = computed(() =>
    this.itemsSig().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly subtotal = computed(() =>
    this.itemsSig().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  readonly shipping = computed(() =>
    this.subtotal() > 0 && this.subtotal() < 100 ? 12 : 0
  );
  readonly tax   = computed(() => Math.round(this.subtotal() * 0.06 * 100) / 100);
  readonly total = computed(() => this.subtotal() + this.shipping() + this.tax());

  constructor(private http: HttpClient) {}

  // ── Server cart (authenticated users) ──────────────────────────────────────

  /**
   * GET /api/v1/cart
   */
  fetchCart(): Observable<Cart> {
    return this.http.get<CartResponse>(this.apiUrl).pipe(
      tap((res) => this.itemsSig.set(res.cart.items)),
      map((res) => res.cart)
    );
  }

  /**
   * POST /api/v1/cart  — body: { productId, quantity }
   */
  addToServerCart(productId: string, quantity = 1): Observable<Cart> {
    return this.http
      .post<CartResponse>(this.apiUrl, { productId, quantity })
      .pipe(
        tap((res) => this.itemsSig.set(res.cart.items)),
        map((res) => res.cart)
      );
  }

  /**
   * PATCH /api/v1/cart/:productId  — body: { quantity }
   */
  updateServerItem(productId: string, quantity: number): Observable<Cart> {
    return this.http
      .patch<CartResponse>(`${this.apiUrl}/${productId}`, { quantity })
      .pipe(
        tap((res) => this.itemsSig.set(res.cart.items)),
        map((res) => res.cart)
      );
  }

  /**
   * DELETE /api/v1/cart/:productId
   */
  removeServerItem(productId: string): Observable<Cart> {
    return this.http
      .delete<CartResponse>(`${this.apiUrl}/${productId}`)
      .pipe(
        tap((res) => this.itemsSig.set(res.cart.items)),
        map((res) => res.cart)
      );
  }

  /**
   * DELETE /api/v1/cart
   */
  clearServerCart(): Observable<Cart> {
    return this.http
      .delete<CartResponse>(this.apiUrl)
      .pipe(
        tap(() => this.itemsSig.set([])),
        map((res) => res.cart)
      );
  }

  // ── Local / guest cart ──────────────────────────────────────────────────────

  addLocal(product: Product, quantity = 1): void {
    const items = [...this.itemsSig()];
    const existing = items.find(
      (i) => (typeof i.product === 'string' ? i.product : (i.product as Product)._id) === product._id
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ product, quantity, price: product.price });
    }
    this.itemsSig.set(items);
    this.persistLocal(items);
  }

  removeLocal(index: number): void {
    const items = this.itemsSig().filter((_, i) => i !== index);
    this.itemsSig.set(items);
    this.persistLocal(items);
  }

  clear(): void {
    this.itemsSig.set([]);
    localStorage.removeItem(LOCAL_CART_KEY);
  }

  /** Helper: get product id regardless of whether item.product is object or string */
  getProductId(item: CartItem): string {
    return typeof item.product === 'string'
      ? item.product
      : (item.product as Product)._id;
  }

  private persistLocal(items: CartItem[]): void {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  }

  private readLocalCart(): CartItem[] {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  }
}
