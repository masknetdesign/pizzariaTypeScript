import { MERCADO_PAGO_ACCESS_TOKEN } from '@env';

interface Item {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
}

interface Payer {
  email: string;
  name: string;
}

interface DeliveryAddress {
  street_name: string;
  street_number: string;
  zip_code: string;
  city: string;
  state: string;
  neighborhood: string;
  complement?: string;
}

interface PaymentRequest {
  items: Item[];
  payer: Payer;
  deliveryAddress: DeliveryAddress;
  notes?: string;
}

export const createPayment = async ({
  items,
  payer,
  deliveryAddress,
  notes,
}: PaymentRequest) => {
  try {
    console.log('Criando pagamento no Mercado Pago:', {
      items,
      payer,
      deliveryAddress,
      notes,
    });

    const preference = {
      items: items.map(item => ({
        ...item,
        currency_id: 'BRL',
      })),
      payer: {
        ...payer,
        address: {
          street_name: deliveryAddress.street_name,
          street_number: deliveryAddress.street_number,
          zip_code: deliveryAddress.zip_code,
        },
      },
      shipments: {
        receiver_address: {
          street_name: deliveryAddress.street_name,
          street_number: deliveryAddress.street_number,
          zip_code: deliveryAddress.zip_code,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          neighborhood: deliveryAddress.neighborhood,
          complement: deliveryAddress.complement,
          country: 'BR',
        },
      },
      back_urls: {
        success: 'https://success.com',
        failure: 'https://failure.com',
        pending: 'https://pending.com',
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [{ id: 'ticket' }],
        installments: 12,
      },
      statement_descriptor: 'PIZZARIA APP',
      external_reference: `ORDER_${Date.now()}`,
      notification_url: 'https://webhook.site/xyz', // Substitua pela sua URL de webhook
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erro na resposta do Mercado Pago:', error);
      throw new Error(error.message || 'Erro ao criar pagamento');
    }

    const data = await response.json();
    console.log('Pagamento criado com sucesso:', data);

    return {
      preferenceId: data.id,
      initPoint: data.init_point,
    };
  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error);
    throw new Error(`Falha ao criar pagamento no Mercado Pago: ${error.message}`);
  }
};
