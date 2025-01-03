import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { LoadingScreen } from '../components/LoadingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { MenuScreen } from '../screens/menu/MenuScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { OrdersScreen } from '../screens/orders/OrdersScreen';
import { CheckoutScreen } from '../screens/checkout/CheckoutScreen';
import { PaymentStatusScreen } from '../screens/checkout/PaymentStatusScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { AddressesScreen } from '../screens/profile/AddressesScreen';
import { OrderSuccessScreen } from '../screens/checkout/OrderSuccessScreen';
import { OrderDetailsScreen } from '../screens/orders/OrderDetailsScreen';
import { ProductDetailsScreen } from '../screens/menu/ProductDetailsScreen';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from 'react-native-paper';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CartIcon = ({ focused, color }: { focused: boolean; color: string }) => {
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View>
      <Ionicons 
        name={focused ? 'cart' : 'cart-outline'} 
        size={24} 
        color={color} 
      />
      {totalItems > 0 && (
        <Badge
          size={16}
          style={{
            position: 'absolute',
            top: -5,
            right: -10,
            backgroundColor: '#EF4444',
          }}
        >
          {totalItems}
        </Badge>
      )}
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Menu') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'CartTab') {
            return <CartIcon focused={focused} color={color} />;
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Menu" 
        component={MenuScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="CartTab" 
        component={CartScreen}
        options={{ 
          headerShown: false,
          title: 'Carrinho'
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#8B5CF6',
          },
          headerTintColor: '#fff',
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="TabNavigator"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
              options={{ title: 'Detalhes do Produto' }}
            />
            <Stack.Screen
              name="Addresses"
              component={AddressesScreen}
              options={{ title: 'Selecione o Endereço' }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ title: 'Finalizar Pedido' }}
            />
            <Stack.Screen
              name="PaymentStatus"
              component={PaymentStatusScreen}
              options={{ title: 'Status do Pagamento' }}
            />
            <Stack.Screen
              name="OrderSuccess"
              component={OrderSuccessScreen}
              options={{ title: 'Pedido Confirmado' }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ title: 'Editar Perfil' }}
            />
            <Stack.Screen
              name="OrderDetails"
              component={OrderDetailsScreen}
              options={{ title: 'Detalhes do Pedido' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Criar Conta' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
