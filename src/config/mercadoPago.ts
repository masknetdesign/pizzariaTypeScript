import Constants from 'expo-constants';

const { MERCADO_PAGO_ACCESS_TOKEN, MERCADO_PAGO_PUBLIC_KEY, APP_URL } = Constants.expoConfig?.extra || {};

console.log('=== Configuração Mercado Pago ===');
console.log('Extra Config:', Constants.expoConfig?.extra);
console.log('Access Token:', MERCADO_PAGO_ACCESS_TOKEN?.substring(0, 20) + '...');
console.log('Public Key:', MERCADO_PAGO_PUBLIC_KEY?.substring(0, 20) + '...');
console.log('App URL:', APP_URL);

if (!MERCADO_PAGO_ACCESS_TOKEN || !MERCADO_PAGO_PUBLIC_KEY) {
  throw new Error('Credenciais do Mercado Pago não configuradas. Verifique o arquivo .env');
}

// Configuração básica do Mercado Pago
export const mercadoPagoConfig = {
  baseURL: 'https://api.mercadopago.com',
  headers: {
    'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`, // Adicionando prefixo Bearer novamente
    'Content-Type': 'application/json',
    'X-Idempotency-Key': new Date().getTime().toString(),
    'Accept': 'application/json',
  },
  publicKey: MERCADO_PAGO_PUBLIC_KEY,
};

// URLs de retorno para pagamento
export const getBackUrls = () => {
  const baseUrl = __DEV__ 
    ? APP_URL // Usando a URL do app configurada no .env
    : 'https://seu-dominio.com'; // Substitua pelo seu domínio em produção
  
  return {
    success: `${baseUrl}/payment/success`,
    failure: `${baseUrl}/payment/failure`,
    pending: `${baseUrl}/payment/pending`,
  };
};
