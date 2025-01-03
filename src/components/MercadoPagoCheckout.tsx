import React from 'react';
import { View } from 'react-native';
import { Payment, initMercadoPago } from '@mercadopago/sdk-react';
import { MERCADO_PAGO_PUBLIC_KEY } from '@env';
import { createPayment } from '../services/mercadoPago';

// Inicializa o SDK do Mercado Pago
initMercadoPago(MERCADO_PAGO_PUBLIC_KEY);

interface MercadoPagoCheckoutProps {
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  payer: {
    email: string;
    name?: string;
  };
  onSuccess?: () => void;
  onFailure?: (error: any) => void;
}

export const MercadoPagoCheckout: React.FC<MercadoPagoCheckoutProps> = ({
  items,
  payer,
  onSuccess,
  onFailure
}) => {
  const handlePayment = async () => {
    try {
      const preference = await createPayment({
        items,
        payer
      });

      return preference;
    } catch (error) {
      console.error('Erro no checkout:', error);
      onFailure?.(error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Payment
        initialization={{ preferenceId: '' }}
        customization={{ visual: { hidePaymentButton: false } }}
        onSubmit={handlePayment}
        onError={onFailure}
        onReady={() => console.log('Checkout pronto')}
      />
    </View>
  );
};
