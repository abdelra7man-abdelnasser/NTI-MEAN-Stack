import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { Address } from '../models/address.model';

interface UserResponse      { success: boolean; user: User; }
interface AddressResponse   { success: boolean; address: Address; }
interface AddressesResponse { success: boolean; addresses: Address[]; }

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/v1/users/profile
   */
  getProfile(): Observable<User> {
    return this.http
      .get<UserResponse>(`${this.apiUrl}/profile`)
      .pipe(map((res) => res.user));
  }

  /**
   * PATCH /api/v1/users/profile
   */
  updateProfile(payload: Partial<Pick<User, 'name' | 'email'>>): Observable<User> {
    return this.http
      .patch<UserResponse>(`${this.apiUrl}/profile`, payload)
      .pipe(map((res) => res.user));
  }

  /**
   * GET /api/v1/users/addresses
   */
  getAddresses(): Observable<Address[]> {
    return this.http
      .get<AddressesResponse>(`${this.apiUrl}/addresses`)
      .pipe(map((res) => res.addresses));
  }

  /**
   * POST /api/v1/users/addresses
   */
  addAddress(payload: Omit<Address, '_id' | 'user'>): Observable<Address> {
    return this.http
      .post<AddressResponse>(`${this.apiUrl}/addresses`, payload)
      .pipe(map((res) => res.address));
  }

  /**
   * DELETE /api/v1/users/addresses/:id
   */
  deleteAddress(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/addresses/${id}`);
  }
}
