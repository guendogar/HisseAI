module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@store': './src/store',
          '@hooks': './src/hooks',
          '@types': './src/types',
          '@utils': './src/utils',
          '@theme': './src/theme',
          '@constants': './src/constants',
          '@config': './src/config',
          '@navigation': './src/navigation',
        },
      },
    ],
  ],
};
