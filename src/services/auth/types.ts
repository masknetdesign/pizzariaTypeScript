export interface User {
  id: string;
  email: string;
  [key: string]: any;
}

export interface AuthResponse {
  user?: User;
  session?: {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
  };
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface AuthContextData {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
}
