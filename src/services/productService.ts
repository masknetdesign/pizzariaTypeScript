import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types';

const fetchSupabase = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const session = await AsyncStorage.getItem('@PizzaApp:session');
    const accessToken = session ? JSON.parse(session).access_token : null;

    if (!accessToken) {
      throw new Error('Usuário não autenticado');
    }

    const url = `${SUPABASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${accessToken}`,
      'Prefer': 'return=representation',
      ...options.headers,
    };

    console.log('ProductService: Fazendo requisição:', {
      url,
      method: options.method,
      headers: {
        ...headers,
        Authorization: 'Bearer [REDACTED]',
      },
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('ProductService: Erro na resposta:', {
        status: response.status,
        error,
      });
      throw new Error(error.message || 'Erro na requisição');
    }

    const data = await response.json();
    console.log('ProductService: Resposta:', {
      status: response.status,
      data,
    });

    return data;
  } catch (error: any) {
    console.error('ProductService: Erro na requisição:', error);
    throw error;
  }
};

export const productService = {
  async getProducts() {
    try {
      console.log('ProductService: Carregando produtos...');
      const data = await fetchSupabase('/rest/v1/products?select=*&order=name', {
        method: 'GET',
      });

      console.log('ProductService: Produtos carregados:', {
        count: data?.length || 0,
      });

      if (!Array.isArray(data)) {
        console.error('ProductService: Resposta inválida:', data);
        throw new Error('Resposta inválida do servidor');
      }

      return data as Product[];
    } catch (error: any) {
      console.error('ProductService: Erro ao carregar produtos:', error);
      throw new Error(error.message || 'Erro ao carregar produtos');
    }
  },

  async getProductById(id: number) {
    try {
      console.log('ProductService: Carregando produto:', id);
      const data = await fetchSupabase(`/rest/v1/products?id=eq.${id}&select=*`, {
        method: 'GET',
      });

      console.log('ProductService: Produto carregado:', data);

      if (!data || data.length === 0) {
        throw new Error('Produto não encontrado');
      }

      return data[0] as Product;
    } catch (error: any) {
      console.error('ProductService: Erro ao carregar produto:', error);
      throw new Error(error.message || 'Erro ao carregar produto');
    }
  },
};
