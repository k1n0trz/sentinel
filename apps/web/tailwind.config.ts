import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        carbon: '#06070A',
        panel: '#0E1117',
        electric: '#2F7BFF',
        vigilance: '#FF3045',
      },
      boxShadow: {
        signal: '0 0 48px rgba(47, 123, 255, 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;

