import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../routes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const adminActions = [
    {
      title: 'Produtos',
      description: 'Adicionar, editar e remover produtos do cardápio',
      icon: 'food',
      onPress: () => navigation.navigate('ProductList'),
    },
    {
      title: 'Pedidos',
      description: 'Visualizar e gerenciar pedidos dos clientes',
      icon: 'clipboard-list',
      onPress: () => navigation.navigate('OrderList'),
    },
    {
      title: 'Categorias',
      description: 'Gerenciar categorias de produtos',
      icon: 'tag',
      onPress: () => navigation.navigate('CategoryList'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>Área Administrativa</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Gerencie produtos, pedidos e configurações
          </Text>
        </View>

        <View style={styles.content}>
          {adminActions.map((action, index) => (
            <Card
              key={index}
              style={styles.card}
              onPress={action.onPress}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Text>{action.icon}</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    {action.title}
                  </Text>
                  <Text variant="bodyMedium" style={styles.cardDescription}>
                    {action.description}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#8B5CF6',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  cardDescription: {
    color: '#666',
    marginTop: 4,
  },
});
