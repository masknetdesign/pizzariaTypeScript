import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, List, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  EditProfile: {
    userId: string;
    email: string;
  };
  Addresses: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Profile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      Alert.alert(
        'Sair',
        'Tem certeza que deseja sair?',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Sim',
            onPress: async () => {
              try {
                setLoading(true);
                await signOut();
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  })
                );
              } catch (error) {
                console.error('Erro ao fazer logout:', error);
                Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleNavigateToAddresses = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Addresses'
      })
    );
  };

  const handleNavigateToEditProfile = () => {
    if (user) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'EditProfile',
          params: {
            userId: user.id,
            email: user.email || '',
          }
        })
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={profile?.name ? profile.name.substring(0, 2).toUpperCase() : 'U'} 
        />
        <Text style={styles.name}>{profile?.name || 'Usuário'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <List.Section>
        <List.Item
          title="Editar Perfil"
          left={props => <List.Icon {...props} icon="account-edit" />}
          onPress={handleNavigateToEditProfile}
        />
        <List.Item
          title="Endereços"
          left={props => <List.Icon {...props} icon="map-marker" />}
          onPress={handleNavigateToAddresses}
        />
        <List.Item
          title="Sair"
          left={props => <List.Icon {...props} icon="logout" color="red" />}
          onPress={handleSignOut}
          titleStyle={{ color: 'red' }}
        />
      </List.Section>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});
