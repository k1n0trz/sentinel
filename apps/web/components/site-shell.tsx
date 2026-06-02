'use client';

import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  ['Inicio', '/'],
  ['Diagnóstico', '/diagnostico'],
  ['Características', '/caracteristicas'],
  ['Soluciones', '/soluciones'],
  ['Sandbox', '/sandbox'],
  ['Precios', '/precios'],
  ['Recursos', '/recursos'],
  ['Contacto', '/contacto'],
] as const;

export type StubPageProps = {
  title: string;
  eyebrow?: string;
  description: string;
  items: string[];
};

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="wrap header-inner">
          <a className="brand" href="/" aria-label="Sentinel Cloud inicio">
            <EyeLogo />
            <span className="brand-name">Sentinel</span>
          </a>
          <nav className="nav" aria-label="Navegación principal">
            {navItems.map(([label, href]) => (
              <a className={pathname === href ? 'active' : undefined} href={href} key={href}>
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <a className="link-login" href="/login">
              Iniciar sesión
            </a>
            <a className="btn btn-primary btn-sm" href="/diagnostico">
              Solicitar demo
            </a>
            <button
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="mobile-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navItems.map(([label, href]) => (
          <a href={href} key={href} onClick={() => setMenuOpen(false)}>
            {label}
          </a>
        ))}
        <a href="/login" onClick={() => setMenuOpen(false)}>
          Iniciar sesión
        </a>
        <a className="btn btn-primary" href="/diagnostico" onClick={() => setMenuOpen(false)}>
          Solicitar demo
        </a>
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <a className="brand" href="/">
              <EyeLogo />
              <span className="brand-name">Sentinel</span>
            </a>
            <div className="eyebrow" style={{ marginTop: 14 }}>
              AI-Powered Cyber Security
            </div>
            <p>Vigilancia inteligente para productos digitales. Protege lo que más importa.</p>
          </div>
          <FooterColumn
            items={[
              ['Diagnóstico', '/diagnostico'],
              ['Características', '/caracteristicas'],
              ['Sandbox Visual', '/sandbox'],
              ['Precios', '/precios'],
              ['Dashboard', '/#como'],
            ]}
            title="Producto"
          />
          <FooterColumn
            items={[
              ['Blog', '/recursos'],
              ['Casos de uso', '/recursos'],
              ['Documentación', '/recursos'],
            ]}
            title="Recursos"
          />
          <div>
            <h4>Contacto</h4>
            <ul>
              <li>hola@sentinelcloud.dev</li>
              <li>Bogotá, Colombia</li>
              <li>sentinelcloud.dev</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Sentinel Cloud. Todos los derechos reservados.</span>
          <span>Uso autorizado · Seguridad defensiva · Bajo impacto</span>
        </div>
      </div>
    </footer>
  );
}

export function StubPage({ description, eyebrow = 'En construcción', items, title }: StubPageProps) {
  return (
    <>
      <SiteHeader />
      <main className="stub">
        <div className="stub-inner">
          <StubEye />
          <span className="eyebrow eyebrow-center">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <ul className="preview-list">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="stub-cta">
            <a className="btn btn-primary btn-lg" href="/diagnostico">
              Solicitar demo
            </a>
            <a className="btn btn-ghost btn-lg" href="/">
              Volver al inicio
            </a>
          </div>
          <div className="stub-progress">
            <i />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export function EyeLogo() {
  return (
    <svg aria-hidden="true" className="eye-logo" fill="none" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 20 Q30 3 57 20 Q30 37 3 20Z" fill="rgba(0,163,255,0.05)" stroke="#00A3FF" strokeWidth="2" />
      <circle cx="30" cy="20" fill="#FF1D35" r="8.5" />
      <circle cx="30" cy="20" fill="#fff" r="3.6" />
    </svg>
  );
}

function StubEye() {
  return (
    <svg aria-label="Sentinel" className="stub-eye" fill="none" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
      <g className="ring">
        <circle cx="100" cy="65" r="42" stroke="rgba(0,163,255,0.35)" strokeDasharray="2 10" strokeWidth="1.5" />
      </g>
      <path d="M18 65 Q100 8 182 65" stroke="#00A3FF" strokeLinecap="round" strokeWidth="3" />
      <path d="M18 65 Q100 122 182 65" stroke="#00A3FF" strokeLinecap="round" strokeWidth="3" />
      <path d="M40 65 Q100 28 160 65" stroke="rgba(0,163,255,0.3)" />
      <path d="M40 65 Q100 102 160 65" stroke="rgba(0,163,255,0.3)" />
      <g className="pupil">
        <circle cx="100" cy="65" fill="url(#stub-gradient)" r="30" />
        <circle cx="100" cy="65" fill="#fff" r="9" />
      </g>
      <defs>
        <radialGradient cx="50%" cy="50%" id="stub-gradient" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="30%" stopColor="#FF1D35" />
          <stop offset="80%" stopColor="#9B0014" />
          <stop offset="100%" stopColor="#3a0008" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function FooterColumn({ items, title }: { items: Array<[string, string]>; title: string }) {
  return (
    <div>
      <h4>{title}</h4>
      <ul>
        {items.map(([item, href]) => (
          <li key={item}>
            <a href={href}>{item}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
