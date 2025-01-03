export interface Address {
  id: string;
  user_id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  created_at: string;
  updated_at: string;
}
