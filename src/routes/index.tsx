import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// App Screens
import { MenuScreen } from '../screens/menu/MenuScreen';
import { ProductDetailsScreen } from '../screens/menu/ProductDetailsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { AdminScreen } from '../screens/admin/AdminScreen';
import { ProductListScreen } from '../screens/admin/ProductListScreen';
import { OrderListScreen } from '../screens/admin/OrderListScreen';
import { CategoryListScreen } from '../screens/admin/CategoryListScreen';
import { CheckoutScreen } from '../screens/checkout/CheckoutScreen';
import { OrdersScreen } from '../screens/orders/OrdersScreen';
import { SuccessScreen } from '../screens/success/SuccessScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  AppTabs: undefined;
  ProductDetails: { productId: string };
  Profile: undefined;
  Cart: undefined;
  Admin: undefined;
  ProductList: undefined;
  OrderList: undefined;
  CategoryList: undefined;
  Checkout: undefined;
  Orders: undefined;
  Success: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#666',
        headerStyle: {
          backgroundColor: '#8B5CF6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Menu" 
        component={MenuScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="food" size={26} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Pedidos" 
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="clipboard-list" size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={26} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const Routes = () => {
  const { user } = useAuth();

  const linking = {
    prefixes: ['pizzariaapp://'],
    config: {
      screens: {
        Success: 'success',
        Menu: 'menu',
        AppTabs: {
          screens: {
            Menu: 'menu',
          }
        }
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#8B5CF6',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!user ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="AppTabs"
              component={AppTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
              options={{ title: 'Detalhes do Produto' }}
            />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{ title: 'Carrinho' }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ title: 'Finalizar Pedido' }}
            />
            <Stack.Screen
              name="Success"
              component={SuccessScreen}
              options={{ 
                title: 'Pedido Confirmado',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Orders"
              component={OrdersScreen}
              options={{ title: 'Meus Pedidos' }}
            />
            <Stack.Screen
              name="Admin"
              component={AdminScreen}
              options={{ title: 'Administração' }}
            />
            <Stack.Screen
              name="ProductList"
              component={ProductListScreen}
              options={{ title: 'Produtos' }}
            />
            <Stack.Screen
              name="OrderList"
              component={OrderListScreen}
              options={{ title: 'Pedidos' }}
            />
            <Stack.Screen
              name="CategoryList"
              component={CategoryListScreen}
              options={{ title: 'Categorias' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
