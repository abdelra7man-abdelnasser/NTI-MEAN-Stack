import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CategoriesResponse } from '../models/category.model';

export interface CategoryPayload { name: string; description?: string; imageUrl?: string; }

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/categories`;
  constructor(private http: HttpClient) {}

  /** GET /api/v1/categories */
  getAll(): Observable<Category[]> {
    return this.http
      .get<CategoriesResponse>(this.apiUrl)
      .pipe(map((res) => res.categories));
  }

  /** GET /api/v1/categories/:id */
  getById(id: string): Observable<Category> {
    return this.http
      .get<{ success: boolean; category: Category }>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.category));
  }

  /** POST /api/v1/categories  (admin) */
  create(payload: CategoryPayload): Observable<Category> {
    return this.http
      .post<{ success: boolean; category: Category }>(this.apiUrl, payload)
      .pipe(map((res) => res.category));
  }

  /** PATCH /api/v1/categories/:id  (admin) */
  update(id: string, payload: Partial<CategoryPayload>): Observable<Category> {
    return this.http
      .patch<{ success: boolean; category: Category }>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((res) => res.category));
  }

  /** DELETE /api/v1/categories/:id  (admin) */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
