'use client';

import { useEffect, useState } from 'react';

type UserDomain = {
  id: string;
  hostname: string;
  verified: boolean;
  verificationMethod?: string;
  verificationToken?: string;
  createdAt: string;
  latestScan?: {
    id: string;
    grade?: string;
    score: number;
    riskLevel: string;
    createdAt: string;
  };
};

type DomainsResponse = {
  domain?: UserDomain;
  domains?: UserDomain[];
  error?: string;
};

const formatLastScan = (domain: UserDomain) => {
  if (!domain.latestScan) return '-';

  return `${domain.latestScan.grade ?? '-'} · ${domain.latestScan.score}/100`;
};

export function PrivateDomains() {
  const [domains, setDomains] = useState<UserDomain[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hostname, setHostname] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadDomains = async () => {
    setError(null);

    try {
      const response = await fetch('/api/app/domains', {
        cache: 'no-store',
      });
      const data = (await response.json()) as DomainsResponse;

      if (!response.ok) {
        setError(data.error ?? 'No se pudieron cargar los dominios.');
        return;
      }

      setDomains(data.domains ?? []);
    } catch {
      setError('No se pudieron cargar los dominios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDomains();
  }, []);

  const addDomain = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const response = await fetch('/api/app/domains', {
        body: JSON.stringify({ hostname }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      const data = (await response.json()) as DomainsResponse;

      if (!response.ok || !data.domain) {
        setError(data.error ?? 'No se pudo agregar el dominio.');
        return;
      }

      setDomains((currentDomains) => [
        data.domain as UserDomain,
        ...currentDomains.filter((domain) => domain.id !== data.domain?.id),
      ]);
      setHostname('');
    } catch {
      setError('No se pudo agregar el dominio.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="private-domains">
      <form className="app-inline-form" onSubmit={addDomain}>
        <label className="sr-only" htmlFor="domain-hostname">
          Dominio
        </label>
        <input
          id="domain-hostname"
          maxLength={255}
          onChange={(event) => setHostname(event.target.value)}
          placeholder="example.com"
          required
          type="text"
          value={hostname}
        />
        <button className="btn btn-primary btn-sm" disabled={saving} type="submit">
          {saving ? 'Agregando...' : 'Agregar'}
        </button>
      </form>

      {loading ? <p className="muted app-panel-state">Cargando dominios...</p> : null}
      {error ? <p className="app-error">{error}</p> : null}

      {!loading && domains.length === 0 ? (
        <p className="muted app-panel-state">Aun no hay dominios guardados.</p>
      ) : null}

      {domains.length > 0 ? (
        <div className="app-table">
          <div className="app-table-row head">
            <span>Dominio</span>
            <span>Verificacion</span>
            <span>Ultimo scan</span>
            <span>Riesgo</span>
            <span>TXT</span>
          </div>
          {domains.map((domain) => (
            <div className="app-table-row" key={domain.id}>
              <strong>{domain.hostname}</strong>
              <span>{domain.verified ? 'Verificado' : 'Pendiente'}</span>
              <span>{formatLastScan(domain)}</span>
              <span>{domain.latestScan?.riskLevel ?? '-'}</span>
              <span>{domain.verificationToken ?? '-'}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
