export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

// Backend returns: { success, accessToken, user }
export interface AuthResponse {
  success: boolean;
  accessToken: string;   // ← backend calls it accessToken, not token
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}
