import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address } from '../types';

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

    console.log('AddressService: Fazendo requisição:', {
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
      console.error('AddressService: Erro na resposta:', {
        status: response.status,
        error,
      });
      throw new Error(error.message || 'Erro na requisição');
    }

    const data = await response.json();
    console.log('AddressService: Resposta:', {
      status: response.status,
      data,
    });

    return data;
  } catch (error: any) {
    console.error('AddressService: Erro na requisição:', error);
    throw error;
  }
};

export const addressService = {
  async getAddresses(userId: string) {
    try {
      console.log('AddressService: Carregando endereços do usuário:', userId);
      const data = await fetchSupabase(`/rest/v1/addresses?user_id=eq.${userId}&select=*`, {
        method: 'GET',
      });

      console.log('AddressService: Endereços carregados:', {
        count: data?.length || 0,
      });

      if (!Array.isArray(data)) {
        console.error('AddressService: Resposta inválida:', data);
        throw new Error('Resposta inválida do servidor');
      }

      return data as Address[];
    } catch (error: any) {
      console.error('AddressService: Erro ao carregar endereços:', error);
      throw new Error(error.message || 'Erro ao carregar endereços');
    }
  },

  async createAddress(address: Omit<Address, 'id'>) {
    try {
      console.log('AddressService: Criando endereço:', address);
      const data = await fetchSupabase('/rest/v1/addresses', {
        method: 'POST',
        body: JSON.stringify(address),
      });

      console.log('AddressService: Endereço criado:', data);
      return data[0] as Address;
    } catch (error: any) {
      console.error('AddressService: Erro ao criar endereço:', error);
      throw new Error(error.message || 'Erro ao criar endereço');
    }
  },

  async updateAddress(id: number, address: Partial<Address>) {
    try {
      console.log('AddressService: Atualizando endereço:', { id, address });
      const data = await fetchSupabase(`/rest/v1/addresses?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(address),
      });

      console.log('AddressService: Endereço atualizado:', data);
      return data[0] as Address;
    } catch (error: any) {
      console.error('AddressService: Erro ao atualizar endereço:', error);
      throw new Error(error.message || 'Erro ao atualizar endereço');
    }
  },

  async deleteAddress(id: number) {
    try {
      console.log('AddressService: Deletando endereço:', id);
      await fetchSupabase(`/rest/v1/addresses?id=eq.${id}`, {
        method: 'DELETE',
      });

      console.log('AddressService: Endereço deletado com sucesso');
    } catch (error: any) {
      console.error('AddressService: Erro ao deletar endereço:', error);
      throw new Error(error.message || 'Erro ao deletar endereço');
    }
  },
};
