import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface CartBadgeProps {
  color: string;
  size: number;
  focused: boolean;
}

export const CartBadge = ({ color, size = 24, focused }: CartBadgeProps) => {
  // Substituir por contexto de carrinho real
  const totalItems = 2;

  return (
    <View style={styles.container}>
      <Icon
        name={focused ? 'cart' : 'cart-outline'}
        size={24}
        color={color}
      />
      {totalItems > 0 && (
        <Badge
          size={16}
          style={styles.badge}
        >
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E53935',
  },
});
