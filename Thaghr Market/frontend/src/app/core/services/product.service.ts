import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductsResponse } from '../models/product.model';

export interface ProductQuery  { page?: number; limit?: number; }
export interface FilterQuery   { category?: string; minPrice?: number; maxPrice?: number; rating?: number; page?: number; limit?: number; }
export interface ProductPayload { title: string; description: string; price: number; category: string; stock: number; imageUrl?: string; }

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;
  constructor(private http: HttpClient) {}

  /** GET /api/v1/products */
  getAll(query: ProductQuery = {}): Observable<ProductsResponse> {
    let params = new HttpParams();
    if (query.page)  params = params.set('page',  String(query.page));
    if (query.limit) params = params.set('limit', String(query.limit));
    return this.http.get<ProductsResponse>(this.apiUrl, { params });
  }

  /** GET /api/v1/products/:id */
  getById(id: string): Observable<Product> {
    return this.http
      .get<{ success: boolean; product: Product }>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.product));
  }

  /** GET /api/v1/products/search?q= */
  search(q: string): Observable<Product[]> {
    return this.http
      .get<{ success: boolean; products: Product[] }>(`${this.apiUrl}/search`, {
        params: new HttpParams().set('q', q),
      })
      .pipe(map((res) => res.products));
  }

  /** GET /api/v1/products/filter */
  filter(query: FilterQuery): Observable<ProductsResponse> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<ProductsResponse>(`${this.apiUrl}/filter`, { params });
  }

  /** POST /api/v1/products  (admin) */
  create(payload: ProductPayload): Observable<Product> {
    return this.http
      .post<{ success: boolean; product: Product }>(this.apiUrl, payload)
      .pipe(map((res) => res.product));
  }

  /** PATCH /api/v1/products/:id  (admin) */
  update(id: string, payload: Partial<ProductPayload>): Observable<Product> {
    return this.http
      .patch<{ success: boolean; product: Product }>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((res) => res.product));
  }

  /** DELETE /api/v1/products/:id  (admin) */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
