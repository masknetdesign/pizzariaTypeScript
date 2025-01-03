import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { MercadoPagoButton } from '../../components/MercadoPagoButton';
import { Address } from '../../types/address';

interface CheckoutScreenProps {
  navigation: any;
  route: {
    params?: {
      selectedAddress?: Address;
    };
  };
}

export function CheckoutScreen({ navigation, route }: CheckoutScreenProps) {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const { items, total } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (route.params?.selectedAddress) {
      setSelectedAddress(route.params.selectedAddress);
    }
  }, [route.params?.selectedAddress]);

  useEffect(() => {
    // Se não houver itens no carrinho, volta para o menu
    if (!items || items.length === 0) {
      navigation.replace('Menu');
    }
  }, [items, navigation]);

  const handleSelectAddress = () => {
    navigation.navigate('Addresses', { selectMode: true });
  };

  // Se não houver itens, não renderiza nada
  if (!items || items.length === 0) {
    return null;
  }

  // Prepara os itens para o Mercado Pago
  const mercadoPagoItems = items.map(item => ({
    id: `${item.product.id}-${item.size?.id || 'no-size'}-${item.edge?.id || 'no-edge'}`,
    title: `${item.product.name}${item.size ? ` (${item.size.name})` : ''}${item.edge ? ` com borda ${item.edge.name}` : ''}`,
    quantity: item.quantity,
    unit_price: (
      item.product.price +
      (item.size?.price || 0) +
      (item.edge?.price || 0)
    ),
    description: `${item.quantity}x ${item.product.name}`,
  }));

  // Prepara os dados do pagador
  const payer = {
    email: user?.email || '',
    name: user?.user_metadata?.name || '',
  };

  // Prepara o endereço de entrega
  const deliveryAddress = selectedAddress ? {
    street_name: selectedAddress.street,
    street_number: selectedAddress.number,
    zip_code: selectedAddress.postal_code,
    city: selectedAddress.city,
    state: selectedAddress.state,
    neighborhood: selectedAddress.neighborhood,
    complement: selectedAddress.complement,
  } : null;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.addressCard}>
        <Card.Content>
          {selectedAddress ? (
            <>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Endereço de Entrega
              </Text>
              <View style={styles.addressContainer}>
                <Text variant="bodyLarge">
                  {selectedAddress.street}, {selectedAddress.number}
                </Text>
                <Text variant="bodyMedium" style={styles.addressDetails}>
                  {selectedAddress.neighborhood} - {selectedAddress.city}, {selectedAddress.state}
                </Text>
                <Text variant="bodyMedium" style={styles.addressDetails}>
                  CEP: {selectedAddress.postal_code}
                </Text>
                {selectedAddress.complement && (
                  <Text variant="bodyMedium" style={styles.addressDetails}>
                    Complemento: {selectedAddress.complement}
                  </Text>
                )}
              </View>
              <Button
                mode="text"
                onPress={handleSelectAddress}
              >
                Trocar Endereço
              </Button>
            </>
          ) : (
            <Button
              mode="contained"
              onPress={handleSelectAddress}
            >
              Selecionar Endereço
            </Button>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Resumo do Pedido
          </Text>
          {items.map((item) => (
            <View key={`${item.product.id}-${item.size?.id}-${item.edge?.id}`} style={styles.itemContainer}>
              <View style={styles.itemInfo}>
                <Text variant="bodyLarge">{item.quantity}x {item.product.name}</Text>
                {item.size && (
                  <Text variant="bodyMedium" style={styles.itemDetails}>
                    Tamanho: {item.size.name} (+R$ {item.size.price.toFixed(2)})
                  </Text>
                )}
                {item.edge && (
                  <Text variant="bodyMedium" style={styles.itemDetails}>
                    Borda: {item.edge.name} (+R$ {item.edge.price.toFixed(2)})
                  </Text>
                )}
              </View>
              <Text variant="bodyLarge" style={styles.itemPrice}>
                R$ {(
                  item.product.price * item.quantity +
                  (item.size?.price || 0) * item.quantity +
                  (item.edge?.price || 0) * item.quantity
                ).toFixed(2)}
              </Text>
            </View>
          ))}
          <Divider style={styles.divider} />
          <View style={styles.totalContainer}>
            <Text variant="titleMedium">Total</Text>
            <Text variant="titleMedium" style={styles.totalPrice}>
              R$ {total.toFixed(2)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.paymentContainer}>
        {selectedAddress ? (
          <MercadoPagoButton
            items={mercadoPagoItems}
            payer={payer}
            deliveryAddress={deliveryAddress}
            navigation={navigation}
          />
        ) : (
          <Text style={styles.warningText}>
            Selecione um endereço de entrega para continuar
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  addressCard: {
    margin: 16,
    marginBottom: 8,
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressDetails: {
    marginTop: 4,
    color: '#666',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemDetails: {
    color: '#666',
    marginTop: 4,
  },
  itemPrice: {
    color: '#8B5CF6',
    fontWeight: 'bold',
    marginLeft: 16,
  },
  divider: {
    marginVertical: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPrice: {
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  paymentContainer: {
    margin: 16,
  },
  warningText: {
    color: '#dc2626',
    textAlign: 'center',
    marginVertical: 8,
  },
});
