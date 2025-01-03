import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/supabaseService';
import { RootStackParamList } from '../../routes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { setUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    // Limpa erros anteriores
    setError('');

    // Validação do nome
    if (!name.trim()) {
      setError('Por favor, insira seu nome');
      return false;
    }

    // Validação do email
    if (!email.trim()) {
      setError('Por favor, insira seu email');
      return false;
    }

    // Validação mais rigorosa do email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor, insira um email válido');
      return false;
    }

    // Validação da senha
    if (!password) {
      setError('Por favor, insira uma senha');
      return false;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setError('');

      console.log('Iniciando registro com:', { email, name });

      const { data, error: registrationError } = await authService.register(
        email.trim().toLowerCase(),
        password,
        name.trim()
      );

      if (registrationError) {
        console.error('Erro no registro:', registrationError);
        if (registrationError.message.includes('already registered')) {
          setError('Este email já está em uso');
        } else if (registrationError.message.includes('invalid')) {
          setError('Email inválido. Por favor, verifique o endereço informado');
        } else {
          setError('Erro ao criar conta. Por favor, tente novamente.');
        }
        return;
      }

      if (!data?.user) {
        console.error('Usuário não retornado após registro');
        setError('Erro ao criar conta. Por favor, tente novamente.');
        return;
      }

      console.log('Usuário registrado:', data.user);

      // Define o usuário no contexto de autenticação
      setUser(data.user);

      // Não é necessário fazer nada com a navegação aqui
      // O Routes.tsx vai detectar que o usuário está logado e mostrar as telas corretas
    } catch (error: any) {
      console.error('Erro no registro:', error);
      if (error.message.includes('Email address') && error.message.includes('invalid')) {
        setError('Email inválido. Por favor, verifique o endereço informado');
      } else {
        setError('Erro ao criar conta. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              Criar Conta
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Preencha os dados abaixo para criar sua conta
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Nome"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              autoCapitalize="words"
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
            />

            <TextInput
              label="Confirmar Senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
            />

            {error ? (
              <Text style={styles.errorText}>
                {error}
              </Text>
            ) : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Criar Conta
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.linkButton}
            >
              Já tem uma conta? Faça login
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
  },
  linkButton: {
    marginTop: 8,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
});
