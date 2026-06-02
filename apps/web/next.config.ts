import type { NextConfig } from 'next';

const legacyHtmlPages = [
  ['index', '/'],
  ['diagnostico', '/diagnostico'],
  ['caracteristicas', '/caracteristicas'],
  ['soluciones', '/soluciones'],
  ['sandbox', '/sandbox'],
  ['precios', '/precios'],
  ['recursos', '/recursos'],
  ['contacto', '/contacto'],
  ['login', '/login'],
] as const;

const nextConfig: NextConfig = {
  transpilePackages: ['@sentinel/shared'],
  async redirects() {
    return legacyHtmlPages.map(([page, destination]) => ({
      source: `/${page}.html`,
      destination,
      permanent: false,
    }));
  },
};

export default nextConfig;
