import { ExpoConfig, ConfigContext } from 'expo/config';
import * as dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Log para debug
console.log('=== Variáveis de Ambiente ===');
console.log('MERCADO_PAGO_PUBLIC_KEY:', process.env.MERCADO_PAGO_PUBLIC_KEY?.substring(0, 20) + '...');
console.log('MERCADO_PAGO_ACCESS_TOKEN:', process.env.MERCADO_PAGO_ACCESS_TOKEN?.substring(0, 20) + '...');
console.log('APP_URL:', process.env.APP_URL);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'PizzariaApp',
  slug: 'pizzaria-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.pizzariaapp'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.yourcompany.pizzariaapp'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  extra: {
    MERCADO_PAGO_PUBLIC_KEY: process.env.MERCADO_PAGO_PUBLIC_KEY,
    MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    APP_URL: process.env.APP_URL,
    eas: {
      projectId: "your-project-id"
    }
  },
});
