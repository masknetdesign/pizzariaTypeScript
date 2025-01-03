import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Divider } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';

type OrderDetailsRouteParams = {
  orderId: string;
};

export const OrderDetailsScreen = () => {
  const route = useRoute();
  const { orderId } = route.params as OrderDetailsRouteParams;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>
            Detalhes do Pedido #{orderId}
          </Text>
          <Text variant="bodyMedium" style={styles.status}>
            Status: Em Preparação
          </Text>
          <Divider style={styles.divider} />
          <View style={styles.itemsContainer}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Itens do Pedido
            </Text>
            {/* Lista de itens será implementada depois */}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  status: {
    color: '#8B5CF6',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  itemsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
