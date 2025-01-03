import React, { createContext, useContext, useState } from 'react';
import { createPayment, getPaymentStatus } from '../services/mercadoPago';
import { useAuth } from './AuthContext';
import { CartItem } from './CartContext';

interface PaymentContextData {
  createOrder: (items: CartItem[], deliveryAddress: DeliveryAddress) => Promise<string>;
  getOrderStatus: (paymentId: string) => Promise<any>;
  loading: boolean;
  error: string | null;
}

interface DeliveryAddress {
  street_name: string;
  street_number: string;
  zip_code: string;
  city: string;
  state: string;
}

const PaymentContext = createContext<PaymentContextData>({} as PaymentContextData);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createOrder = async (items: CartItem[], deliveryAddress: DeliveryAddress) => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.email) {
        throw new Error('Usuário não autenticado');
      }

      const paymentInput = {
        items: items.map(item => ({
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price
        })),
        payer: {
          email: user.email,
          name: user.user_metadata?.name
        },
        deliveryAddress
      };

      const response = await createPayment(paymentInput);
      return response.init_point;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pagamento');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatus = async (paymentId: string) => {
    try {
      setLoading(true);
      setError(null);

      const status = await getPaymentStatus(paymentId);
      return status;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar status do pagamento');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        createOrder,
        getOrderStatus,
        loading,
        error
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);

  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }

  return context;
};
