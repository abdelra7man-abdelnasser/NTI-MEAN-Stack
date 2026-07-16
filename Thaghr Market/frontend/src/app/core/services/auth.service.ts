import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../models/user.model';

const TOKEN_KEY = 'thaghr_token';
const USER_KEY  = 'thaghr_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly currentUserSig = signal<User | null>(this.readStoredUser());
  readonly currentUser     = this.currentUserSig.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSig());

  constructor(private http: HttpClient) {}

  /**
   * POST /api/v1/auth/login
   * Backend returns { success, accessToken, user }
   */
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, payload, { withCredentials: true })
      .pipe(tap((res) => this.setSession(res)));
  }

  /**
   * POST /api/v1/auth/register
   * Backend returns { success, accessToken, user }
   */
  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload, { withCredentials: true })
      .pipe(tap((res) => this.setSession(res)));
  }

  /**
   * POST /api/v1/auth/logout
   * Clears HTTP-only cookie on backend + local state
   */
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSig.set(null);
  }

  /** Returns stored JWT for the interceptor */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setSession(res: AuthResponse): void {
    // Backend key is `accessToken`
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.currentUserSig.set(res.user);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
