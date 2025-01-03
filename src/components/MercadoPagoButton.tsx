import React from 'react';
import { Button } from 'react-native-paper';
import { Linking } from 'react-native';
import { createPayment } from '../services/mercadoPago';
import { getPaymentStatus } from '../services/paymentWebhook';
import { NavigationProp } from '@react-navigation/native';

interface MercadoPagoButtonProps {
  items: any[];
  payer: any;
  deliveryAddress: any;
  notes?: string;
  navigation: NavigationProp<any>;
}

export const MercadoPagoButton: React.FC<MercadoPagoButtonProps> = ({
  items,
  payer,
  deliveryAddress,
  notes,
  navigation,
}) => {
  const handlePayment = async () => {
    try {
      // Criar preferência de pagamento
      const paymentData = await createPayment({
        items,
        payer,
        deliveryAddress,
        notes,
      });

      // Navegar para a tela de status com status inicial loading
      navigation.navigate('PaymentStatus', {
        status: 'loading',
      });

      // Abrir URL do Mercado Pago
      const supported = await Linking.canOpenURL(paymentData.initPoint);
      if (supported) {
        await Linking.openURL(paymentData.initPoint);

        // Iniciar polling do status do pagamento
        startPaymentStatusPolling(paymentData.preferenceId);
      } else {
        throw new Error('Não foi possível abrir o link de pagamento');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      navigation.navigate('PaymentStatus', {
        status: 'failure',
        error: error.message,
      });
    }
  };

  const startPaymentStatusPolling = async (preferenceId: string) => {
    let attempts = 0;
    const maxAttempts = 10;
    const interval = 5000; // 5 segundos

    const checkStatus = async () => {
      try {
        const status = await getPaymentStatus(preferenceId);
        
        switch (status.status) {
          case 'approved':
            navigation.navigate('PaymentStatus', {
              status: 'success',
              paymentId: status.payment_id,
            });
            return true;
          case 'rejected':
          case 'cancelled':
            navigation.navigate('PaymentStatus', {
              status: 'failure',
              paymentId: status.payment_id,
              error: status.status_detail,
            });
            return true;
          case 'pending':
          case 'in_process':
            navigation.navigate('PaymentStatus', {
              status: 'pending',
              paymentId: status.payment_id,
            });
            return false;
          default:
            return false;
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        return false;
      }
    };

    const poll = async () => {
      attempts++;
      const finished = await checkStatus();

      if (!finished && attempts < maxAttempts) {
        setTimeout(poll, interval);
      }
    };

    poll();
  };

  return (
    <Button
      mode="contained"
      onPress={handlePayment}
      style={{ marginVertical: 10 }}
      labelStyle={{ fontSize: 16 }}
    >
      Pagar com Mercado Pago
    </Button>
  );
};
