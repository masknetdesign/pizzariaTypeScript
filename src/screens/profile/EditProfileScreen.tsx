import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../config/supabase';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  EditProfile: {
    userId: string;
    email: string;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export const EditProfileScreen = ({ route }: Props) => {
  const { userId, email } = route.params;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setName(data.full_name || '');
        setPhone(data.phone || '');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: name,
          phone: phone,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSuccess(true);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          label="Email"
          value={email}
          disabled
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Nome completo"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Telefone"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          style={styles.input}
          keyboardType="phone-pad"
        />
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        {success && (
          <Text style={styles.successText}>Perfil atualizado com sucesso!</Text>
        )}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Salvar
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  successText: {
    color: 'green',
    marginBottom: 16,
  },
});
