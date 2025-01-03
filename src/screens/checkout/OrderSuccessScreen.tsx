import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useCart } from '../../contexts/CartContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const OrderSuccessScreen = () => {
  const navigation = useNavigation();
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  const handleGoToOrders = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'AppTabs',
            state: {
              routes: [
                { name: 'MenuStack' },
                { name: 'Cart' },
                { name: 'OrdersStack' },
                { name: 'Profile' }
              ],
              index: 2, // OrdersStack
            },
          },
        ],
      })
    );
  };

  const handleGoToMenu = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'AppTabs',
            state: {
              routes: [
                { name: 'MenuStack' },
                { name: 'Cart' },
                { name: 'OrdersStack' },
                { name: 'Profile' }
              ],
              index: 0, // MenuStack
            },
          },
        ],
      })
    );
  };

  return (
    <View style={styles.container}>
      <Icon name="check-circle" size={100} color="#4CAF50" style={styles.icon} />
      <Text variant="headlineMedium" style={styles.title}>
        Pedido Realizado!
      </Text>
      <Text variant="bodyLarge" style={styles.description}>
        Seu pedido foi recebido e está sendo preparado.
      </Text>
      <Text variant="bodyMedium" style={styles.description}>
        Acompanhe o status do seu pedido na aba "Pedidos".
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleGoToOrders}
          style={[styles.button, styles.primaryButton]}
        >
          Ver Meus Pedidos
        </Button>
        <Button
          mode="outlined"
          onPress={handleGoToMenu}
          style={styles.button}
        >
          Voltar ao Cardápio
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#4CAF50',
  },
  description: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 32,
    gap: 16,
  },
  button: {
    width: '100%',
  },
  primaryButton: {
    marginBottom: 8,
  },
});
