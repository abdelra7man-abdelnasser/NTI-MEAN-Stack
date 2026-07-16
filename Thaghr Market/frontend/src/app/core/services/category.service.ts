import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CategoriesResponse } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/v1/categories
   * Backend returns { success, categories: [...] }
   */
  getAll(): Observable<Category[]> {
    return this.http
      .get<CategoriesResponse>(this.apiUrl)
      .pipe(map((res) => res.categories));
  }
}
