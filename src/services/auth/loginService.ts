import { authService } from '../auth';

export const loginService = {
  async login(email: string, password: string) {
    try {
      console.log('LoginService: Iniciando login...');
      
      // Limpar e validar email
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) {
        return {
          error: 'Email e senha são obrigatórios'
        };
      }

      const response = await authService.signIn(cleanEmail, password);
      console.log('LoginService: Resposta do login:', {
        hasUser: !!response.user,
        hasError: !!response.error
      });

      if (response.error) {
        return {
          error: response.error
        };
      }

      if (!response.user) {
        return {
          error: 'Usuário não encontrado'
        };
      }

      return {
        success: true,
        user: response.user,
        session: response.session
      };
    } catch (error: any) {
      console.error('LoginService: Erro inesperado:', error);
      return {
        error: error.message || 'Erro ao fazer login. Por favor, tente novamente.'
      };
    }
  }
};
