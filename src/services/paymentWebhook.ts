import { mercadoPagoConfig } from '../config/mercadoPago';

export interface PaymentWebhook {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

export interface PaymentStatus {
  status: 'approved' | 'pending' | 'in_process' | 'rejected' | 'refunded' | 'cancelled' | 'in_mediation';
  status_detail: string;
  external_reference: string;
  payment_id: string;
  payment_type: string;
  payment_method: string;
  merchant_order_id: string;
}

export const getPaymentStatus = async (paymentId: string): Promise<PaymentStatus> => {
  try {
    const response = await fetch(
      `${mercadoPagoConfig.baseURL}/v1/payments/${paymentId}`,
      {
        headers: mercadoPagoConfig.headers,
      }
    );

    if (!response.ok) {
      throw new Error('Falha ao obter status do pagamento');
    }

    const data = await response.json();
    
    return {
      status: data.status,
      status_detail: data.status_detail,
      external_reference: data.external_reference,
      payment_id: data.id,
      payment_type: data.payment_type_id,
      payment_method: data.payment_method_id,
      merchant_order_id: data.order?.id,
    };
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    throw error;
  }
};

export const handlePaymentWebhook = async (webhookData: PaymentWebhook): Promise<PaymentStatus> => {
  try {
    // Verifica se é uma notificação de pagamento
    if (webhookData.type !== 'payment') {
      throw new Error('Tipo de webhook não suportado');
    }

    // Obtém os detalhes do pagamento
    const paymentStatus = await getPaymentStatus(webhookData.data.id);

    // Aqui você pode adicionar lógica adicional como:
    // - Atualizar o status do pedido no seu banco de dados
    // - Enviar notificação push para o usuário
    // - Gerar nota fiscal
    // - etc.

    return paymentStatus;
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    throw error;
  }
};
