import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Chip, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../config/supabase';

interface Order {
  id: number;
  created_at: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  total: number;
  user_id: string;
  items: Array<{
    product_id: number;
    quantity: number;
    price: number;
  }>;
}

export const OrderListScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'preparing': return '#8B5CF6';
      case 'ready': return '#22C55E';
      case 'delivered': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <View>
            <Text variant="titleMedium" style={styles.orderId}>
              Pedido #{item.id}
            </Text>
            <Text variant="bodySmall" style={styles.orderDate}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.statusText}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>

        <View style={styles.orderItems}>
          <Text variant="bodyMedium">Itens: {item.items.length}</Text>
          <Text variant="titleMedium" style={styles.total}>
            R$ {item.total.toFixed(2)}
          </Text>
        </View>

        <View style={styles.actions}>
          {item.status !== 'delivered' && (
            <>
              {item.status === 'pending' && (
                <IconButton
                  icon="food"
                  mode="contained"
                  containerColor="#8B5CF6"
                  iconColor="#fff"
                  size={20}
                  onPress={() => updateOrderStatus(item.id, 'preparing')}
                />
              )}
              {item.status === 'preparing' && (
                <IconButton
                  icon="check-circle"
                  mode="contained"
                  containerColor="#22C55E"
                  iconColor="#fff"
                  size={20}
                  onPress={() => updateOrderStatus(item.id, 'ready')}
                />
              )}
              {item.status === 'ready' && (
                <IconButton
                  icon="truck-delivery"
                  mode="contained"
                  containerColor="#6B7280"
                  iconColor="#fff"
                  size={20}
                  onPress={() => updateOrderStatus(item.id, 'delivered')}
                />
              )}
            </>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando pedidos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium">Nenhum pedido encontrado</Text>
          </View>
        }
      />
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
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  card: {
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontWeight: 'bold',
  },
  orderDate: {
    color: '#666',
    marginTop: 4,
  },
  statusChip: {
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
  },
  orderItems: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  total: {
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
