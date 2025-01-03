export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  addresses: Address[];
  created_at: Date;
  updated_at?: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  available: boolean;
}

export interface Address {
  id: number;
  user_id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface Order {
  id: number;
  user_id: string;
  address_id: number;
  status: string;
  total: number;
  created_at: string;
  payment_status: string;
  payment_method: string;
  payment_id?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Session {
  user: User | null;
  access_token: string | null;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: string;
}

export interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface CartContextData {
  items: CartItem[];
  addToCart: (item: {
    product: Product;
    quantity: number;
  }) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
}
