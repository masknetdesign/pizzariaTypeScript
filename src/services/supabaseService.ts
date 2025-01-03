import supabase from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Order, User, Address, OrderItem } from '../types';

// Serviços de Produtos
export const productService = {
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) throw error;

    console.log('Produtos do banco:', data);

    // Transformar URLs relativas em URLs públicas
    const productsWithImages = data.map(product => {
      let finalImageUrl;
      
      try {
        if (product.image_url) {
          if (product.image_url.startsWith('http')) {
            finalImageUrl = product.image_url;
          } else {
            const { data: urlData } = supabase.storage.from('products').getPublicUrl(product.image_url);
            finalImageUrl = urlData.publicUrl;
          }
        }
      } catch (error) {
        console.error(`Erro ao processar imagem do produto ${product.name}:`, error);
      }

      finalImageUrl = finalImageUrl || 'https://via.placeholder.com/300x200?text=Sem+Imagem';
      console.log(`Produto ${product.name} - URL final da imagem:`, finalImageUrl);

      return {
        ...product,
        image_url: finalImageUrl
      };
    });

    return productsWithImages;
  },

  async addProduct(product: Product): Promise<string> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async uploadImage(uri: string, filename: string): Promise<string> {
    console.log('Iniciando upload da imagem:', { uri, filename });

    try {
      // Converter URI para Blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Gerar um nome único para o arquivo
      const fileExt = filename.split('.').pop();
      const filePath = `${Date.now()}.${fileExt}`;
      console.log('Caminho do arquivo no storage:', filePath);

      // Fazer o upload
      const { error: uploadError } = await supabase
        .storage
        .from('products')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      console.log('Upload concluído com sucesso');

      // Gerar e testar a URL pública
      const { data: urlData } = supabase.storage.from('products').getPublicUrl(filePath);
      console.log('URL pública do arquivo:', urlData.publicUrl);

      // Testar se a URL é acessível
      try {
        const testResponse = await fetch(urlData.publicUrl);
        if (!testResponse.ok) {
          throw new Error(`URL não acessível: ${testResponse.status}`);
        }
        console.log('URL da imagem testada com sucesso');
      } catch (error) {
        console.error('Erro ao testar URL da imagem:', error);
      }

      return filePath;
    } catch (error) {
      console.error('Erro durante o processo de upload:', error);
      throw error;
    }
  }
};

// Serviços de Pedidos
export const orderService = {
  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    console.log('Iniciando criação do pedido:', order);

    try {
      // Cria o pedido
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: order.user_id,
          items: order.items,
          total: order.total,
          status: order.status,
          address: order.address
        })
        .select('id')
        .single();

      if (error) {
        console.error('Erro ao criar pedido:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Pedido criado mas ID não retornado');
      }

      console.log('Pedido criado com sucesso:', data);
      return data.id;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  },

  async getUserOrders(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, items(*)`) // Corrigido para buscar todos os itens
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pedidos:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    console.log('Atualizando status do pedido:', { orderId, status });

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        throw error;
      }

      console.log('Status atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }
};

// Serviços de Autenticação
class AuthService {
  async getCurrentUser() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session?.user;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      console.log('Tentando fazer login com email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        throw error;
      }

      // Verifica se o usuário existe
      if (!data?.user) {
        throw new Error('Usuário não encontrado');
      }

      // Verifica se o perfil existe, se não, cria
      await this.ensureProfile(data.user.id, email);

      console.log('Login bem-sucedido:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Erro no serviço de login:', error);
      return { data: null, error };
    }
  }

  async register(email: string, password: string, name: string) {
    try {
      console.log('Tentando registrar usuário:', { email, name });

      // Primeiro, verifica se o usuário já existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        console.error('Usuário já existe:', existingUser);
        return { 
          error: new Error('Este email já está registrado'),
          data: null 
        };
      }

      // Tenta criar o usuário
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        console.error('Erro no registro:', error);
        return { data: null, error };
      }

      if (!data?.user) {
        console.error('Usuário não retornado após signUp');
        return { 
          data: null, 
          error: new Error('Erro ao criar usuário') 
        };
      }

      console.log('Usuário criado:', data.user);

      // Aguarda um momento para o trigger criar o perfil
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verifica se o perfil foi criado
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Erro ao verificar perfil:', profileError);
      } else {
        console.log('Perfil encontrado:', profile);
      }

      // Faz login automaticamente após o registro
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        console.error('Erro ao fazer login após registro:', loginError);
        return { data: null, error: loginError };
      }

      console.log('Login bem-sucedido após registro:', loginData);
      return { data: loginData, error: null };
    } catch (error) {
      console.error('Erro no serviço de registro:', error);
      return { data: null, error };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { error };
    }
  }

  async ensureProfile(userId: string, email: string) {
    try {
      console.log('Verificando perfil do usuário:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!profile) {
        // Se o perfil não existe, aguarda um momento e verifica novamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: retryProfile, error: retryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (retryError && retryError.code !== 'PGRST116') {
          throw retryError;
        }

        if (!retryProfile) {
          // Se ainda não existe, então cria
          const name = email.split('@')[0];
          await this.createProfile(userId, name, email);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar/criar perfil:', error);
      throw error;
    }
  }

  async createProfile(userId: string, name: string, email: string) {
    try {
      console.log('Criando perfil para usuário:', userId);
      const { error } = await supabase
        .from('profiles')
        .insert([{ 
          id: userId, 
          name, 
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;
      console.log('Perfil criado com sucesso');
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
