import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { supabaseFetch, supabaseConfig } from '../config/supabase';

console.log('Configuração do Supabase:', supabaseConfig);

if (!supabaseConfig.url || !supabaseConfig.anonKey) {
  throw new Error('Missing Supabase environment variables');
}

const SESSION_KEY = '@PizzaApp:session';

export const authService = {
  async signIn(email: string, password: string) {
    try {
      console.log('Tentando fazer login com:', { email });

      const data = await supabaseFetch('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log('Resposta do login:', data);

      if (!data.error) {
        if (data.access_token) {
          // Obter dados do usuário
          const userData = await supabaseFetch('/auth/v1/user', {
            headers: {
              'Authorization': `Bearer ${data.access_token}`,
            },
          });

          console.log('Dados do usuário:', userData);

          const session = {
            user: userData,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
          };

          await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

          return session;
        }

        return { error: 'Erro ao fazer login' };
      }

      return { error: data.error_description || data.msg || 'Erro ao fazer login' };
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      return { error: error.message || 'Erro ao fazer login' };
    }
  },

  async signOut() {
    try {
      const sessionStr = await AsyncStorage.getItem(SESSION_KEY);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        await supabaseFetch('/auth/v1/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
      }
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  },

  async getSession() {
    try {
      const sessionStr = await AsyncStorage.getItem(SESSION_KEY);
      if (!sessionStr) return null;

      const session = JSON.parse(sessionStr);
      if (!session.access_token) return null;

      const user = await supabaseFetch('/auth/v1/user', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (user.error) {
        await AsyncStorage.removeItem(SESSION_KEY);
        return null;
      }

      return {
        user,
        access_token: session.access_token,
      };
    } catch (error) {
      console.error('Erro ao obter sessão:', error);
      await AsyncStorage.removeItem(SESSION_KEY);
      return null;
    }
  },
};
