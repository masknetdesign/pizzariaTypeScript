import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { loginService } from '../../services/auth/loginService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../@types/navigation';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuth();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Iniciando login...');
      const response = await loginService.login(email, password);
      console.log('Resposta do login:', response);

      if (response.error) {
        console.error('Erro no login:', response.error);
        setError(response.error);
        return;
      }

      if (!response.user) {
        console.error('Usuário não encontrado na resposta');
        setError('Erro ao fazer login. Por favor, tente novamente.');
        return;
      }

      console.log('Login bem-sucedido:', response.user);
      setUser(response.user);
      navigation.navigate('Menu');
    } catch (error: any) {
      console.error('Erro inesperado no login:', error);
      setError(error.message || 'Erro ao fazer login. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Bem-vindo!
        </Text>

        {error && (
          <Text style={styles.errorText}>
            {error}
          </Text>
        )}

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          disabled={loading}
        />

        <TextInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          disabled={loading}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading || !email || !password}
          style={styles.button}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Register')}
          style={styles.linkButton}
        >
          Não tem uma conta? Cadastre-se
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  linkButton: {
    marginTop: 8,
  },
  errorText: {
    color: '#B00020',
    textAlign: 'center',
    marginBottom: 15,
  },
});
