import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

type PaymentStatus = 'success' | 'failure' | 'pending' | 'loading';

interface PaymentStatusScreenProps {
  status: PaymentStatus;
  paymentId?: string;
  error?: string;
}

const StatusContent = {
  success: {
    icon: 'checkmark-circle',
    color: '#4CAF50',
    title: 'Pagamento Aprovado!',
    message: 'Seu pedido foi confirmado e está sendo preparado.',
    buttonText: 'Ver Status do Pedido',
  },
  failure: {
    icon: 'close-circle',
    color: '#F44336',
    title: 'Pagamento Recusado',
    message: 'Houve um problema com seu pagamento. Por favor, tente novamente.',
    buttonText: 'Tentar Novamente',
  },
  pending: {
    icon: 'time',
    color: '#FF9800',
    title: 'Pagamento Pendente',
    message: 'Aguardando confirmação do pagamento.',
    buttonText: 'Verificar Status',
  },
  loading: {
    icon: 'reload',
    color: '#2196F3',
    title: 'Processando...',
    message: 'Aguarde enquanto processamos seu pagamento.',
    buttonText: '',
  },
};

export const PaymentStatusScreen: React.FC = () => {
  const route = useRoute<RouteProp<any>>();
  const navigation = useNavigation();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [paymentId, setPaymentId] = useState<string>();

  useEffect(() => {
    const params = route.params as PaymentStatusScreenProps;
    if (params?.status) {
      setStatus(params.status);
      setPaymentId(params.paymentId);
    }
  }, [route.params]);

  const handleButtonPress = () => {
    switch (status) {
      case 'success':
        // Navegar para a tela de status do pedido
        navigation.navigate('OrderStatus', { orderId: paymentId });
        break;
      case 'failure':
        // Voltar para o checkout
        navigation.goBack();
        break;
      case 'pending':
        // Atualizar status do pagamento
        checkPaymentStatus();
        break;
    }
  };

  const checkPaymentStatus = async () => {
    // Aqui você implementará a verificação do status do pagamento
    // usando o webhook ou a API do Mercado Pago
    setStatus('loading');
    // Simular uma verificação
    setTimeout(() => {
      setStatus('pending');
    }, 2000);
  };

  const currentStatus = StatusContent[status];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons
          name={currentStatus.icon as any}
          size={80}
          color={currentStatus.color}
          style={styles.icon}
        />
        <Text style={[styles.title, { color: currentStatus.color }]}>
          {currentStatus.title}
        </Text>
        <Text style={styles.message}>{currentStatus.message}</Text>
        {status === 'loading' ? (
          <ActivityIndicator size="large" color={currentStatus.color} style={styles.loading} />
        ) : (
          currentStatus.buttonText && (
            <Button
              mode="contained"
              onPress={handleButtonPress}
              style={[styles.button, { backgroundColor: currentStatus.color }]}
              labelStyle={styles.buttonText}
            >
              {currentStatus.buttonText}
            </Button>
          )
        )}
        {paymentId && (
          <Text style={styles.paymentId}>ID do Pagamento: {paymentId}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    paddingHorizontal: 30,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  loading: {
    marginTop: 20,
  },
  paymentId: {
    fontSize: 12,
    color: '#999',
    marginTop: 20,
  },
});

export default PaymentStatusScreen;
