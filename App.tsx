import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import { Linking, Alert } from 'react-native';

export default function App() {
  const handleDeepLink = ({ url }: { url: string }) => {
    console.log('URL recebida:', url);

    if (url.includes('success')) {
      Alert.alert('Sucesso', 'Pagamento realizado com sucesso!');
    } else if (url.includes('failure')) {
      Alert.alert('Erro', 'O pagamento não foi concluído. Tente novamente.');
    } else if (url.includes('pending')) {
      Alert.alert('Pendente', 'O pagamento está pendente de processamento.');
    }
  };

  React.useEffect(() => {
    // Verificar se o app foi aberto por uma URL
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Adicionar o listener para URLs
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <PaperProvider>
              <AppNavigator />
            </PaperProvider>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
