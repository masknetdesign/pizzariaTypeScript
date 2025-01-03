import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/supabaseService';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type OrdersStackParamList = {
  Orders: undefined;
  EditProfile: {
    userId: string;
    email: string;
  };
};

type NavigationProp = NativeStackNavigationProp<OrdersStackParamList, 'Orders'>;

export const OrdersScreen = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const loadOrders = async () => {
    try {
      if (!user?.id) return;
      
      const userOrders = await orderService.getUserOrders(user.id);
      setOrders(userOrders.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return theme.colors.warning;
      case 'preparing':
        return theme.colors.primary;
      case 'ready':
        return theme.colors.success;
      case 'delivered':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.onSurface;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendente';
      case 'preparing':
        return 'Preparando';
      case 'ready':
        return 'Pronto';
      case 'delivered':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium">Pedido #{item.id.slice(0, 8)}</Text>
          <Text 
            variant="labelLarge" 
            style={[styles.status, { color: getStatusColor(item.status) }]}
          >
            {getStatusText(item.status)}
          </Text>
        </View>

        <Text variant="labelMedium" style={styles.date}>
          {formatDate(item.created_at)}
        </Text>

        <View style={styles.itemsContainer}>
          {item.items.map((orderItem, index) => (
            <Text key={index} variant="bodyMedium" style={styles.item}>
              {orderItem.quantity}x {orderItem.product?.name || 'Pizza'} - {orderItem.size} 
              {orderItem.edge ? ` (Borda: ${orderItem.edge})` : ''}
              {' - '}R$ {orderItem.price.toFixed(2)}
            </Text>
          ))}
        </View>

        <View style={styles.addressContainer}>
          <Text variant="labelLarge">Endereço de entrega:</Text>
          <Text variant="bodyMedium">
            {item.address.street}, {item.address.number}
            {item.address.complement ? `, ${item.address.complement}` : ''}
          </Text>
          <Text variant="bodyMedium">
            {item.address.neighborhood} - {item.address.city}/{item.address.state}
          </Text>
          <Text variant="bodyMedium">CEP: {item.address.cep}</Text>
        </View>

        <View style={styles.footer}>
          <Text variant="titleMedium">
            Total: R$ {item.total.toFixed(2)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const handleEditProfile = () => {
    if (user) {
      // @ts-ignore
      navigation.navigate('EditProfile', {
        userId: user.id,
        email: user.email || '',
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Carregando pedidos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Button onPress={handleEditProfile}>Editar Perfil</Button>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium">Nenhum pedido encontrado</Text>
            <Text variant="bodyMedium">
              Seus pedidos aparecerão aqui quando você fizer algum.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

type OrderItem = {
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
  size: string;
  edge: string;
};

type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  status: {
    fontWeight: 'bold',
  },
  date: {
    marginBottom: 16,
    color: '#666',
  },
  itemsContainer: {
    marginBottom: 16,
  },
  item: {
    marginBottom: 4,
  },
  addressContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});