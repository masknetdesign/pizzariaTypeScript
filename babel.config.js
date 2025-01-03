module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: [
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'MERCADO_PAGO_PUBLIC_KEY',
            'MERCADO_PAGO_ACCESS_TOKEN',
            'APP_URL'
          ],
          safe: true,
          allowUndefined: false,
        },
      ],
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@config': './src/config',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@types': './src/types',
            '@contexts': './src/contexts'
          }
        }
      ]
    ],
  };
};
