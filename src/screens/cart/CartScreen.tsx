import React from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { Text, Button, IconButton, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCart } from '../../contexts/CartContext';
import { CartItem } from '../../types';
import { Address } from '../../types/address';

type RootStackParamList = {
  TabNavigator: undefined;
  Addresses: { fromCart: boolean };
  Checkout: { selectedAddress: Address };
  PaymentStatus: undefined;
  OrderSuccess: undefined;
};

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const CartScreen = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { items, total, removeFromCart, updateQuantity, clearCart } = useCart();

  const handleCheckout = () => {
    console.log('Tentando navegar para Addresses');
    if (items.length > 0) {
      navigation.navigate('Addresses', { fromCart: true });
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => {
    const itemTotal = item.totalPrice || 0;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.itemHeader}>
            <Image 
              source={{ uri: item.product.image_url }} 
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text variant="titleMedium" style={styles.productName}>
                {item.product.name}
              </Text>
              {item.size && (
                <Text variant="bodyMedium" style={styles.optionText}>
                  Tamanho: {item.size.name} (+R$ {item.size.price.toFixed(2)})
                </Text>
              )}
              {item.edge && (
                <Text variant="bodyMedium" style={styles.optionText}>
                  Borda: {item.edge.name} (+R$ {item.edge.price.toFixed(2)})
                </Text>
              )}
              <Text variant="bodyMedium" style={styles.optionText}>
                Preço unitário: R$ {(
                  item.product.price +
                  (item.size?.price || 0) +
                  (item.edge?.price || 0)
                ).toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.itemFooter}>
            <View style={styles.quantityControls}>
              <IconButton
                icon="minus"
                size={20}
                onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                mode="contained"
                containerColor="#8B5CF6"
                iconColor="#fff"
                disabled={item.quantity <= 1}
              />
              <Text variant="titleMedium" style={styles.quantity}>
                {item.quantity}
              </Text>
              <IconButton
                icon="plus"
                size={20}
                onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                mode="contained"
                containerColor="#8B5CF6"
                iconColor="#fff"
              />
            </View>

            <View style={styles.priceContainer}>
              <Text variant="titleMedium" style={styles.price}>
                R$ {itemTotal.toFixed(2)}
              </Text>
              <IconButton
                icon="delete"
                size={20}
                onPress={() => removeFromCart(item.product.id)}
                mode="contained"
                containerColor="#EF4444"
                iconColor="#fff"
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <Text variant="titleLarge" style={styles.emptyText}>
            Seu carrinho está vazio
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.continueButton}
          >
            Continuar Comprando
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text variant="titleMedium">Total:</Text>
          <Text variant="headlineSmall" style={styles.totalPrice}>
            R$ {total.toFixed(2)}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={clearCart}
            style={styles.clearButton}
            textColor="#EF4444"
          >
            Limpar Carrinho
          </Button>
          <Button
            mode="contained"
            onPress={handleCheckout}
            style={styles.checkoutButton}
            disabled={items.length === 0}
          >
            Finalizar Pedido
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
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
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  optionText: {
    color: '#666',
    marginBottom: 2,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    color: '#8B5CF6',
    fontWeight: 'bold',
    marginRight: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalPrice: {
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  clearButton: {
    flex: 1,
    borderColor: '#EF4444',
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#8B5CF6',
  },
});
