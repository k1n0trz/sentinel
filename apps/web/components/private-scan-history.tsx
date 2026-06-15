'use client';

import { useEffect, useState } from 'react';

type RecentSavedScan = {
  id: string;
  targetUrl: string;
  finalUrl?: string;
  status: string;
  score: number;
  grade?: string;
  riskLevel: string;
  httpStatus?: number;
  responseTimeMs?: number;
  public: boolean;
  hiddenFromPublicResults: boolean;
  createdAt: string;
};

type ScanHistoryResponse = {
  scans?: RecentSavedScan[];
  error?: string;
};

const formatTarget = (scan: RecentSavedScan) => {
  try {
    return new URL(scan.finalUrl ?? scan.targetUrl).hostname;
  } catch {
    return scan.finalUrl ?? scan.targetUrl;
  }
};

const formatCreatedAt = (createdAt: string) =>
  new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(createdAt));

export function PrivateScanHistory() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState<RecentSavedScan[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadScans = async () => {
      try {
        const response = await fetch('/api/app/scans/recent', {
          cache: 'no-store',
        });
        const data = (await response.json()) as ScanHistoryResponse;

        if (cancelled) return;

        if (!response.ok) {
          setError(data.error ?? 'No se pudo cargar el historial.');
          return;
        }

        setScans(data.scans ?? []);
      } catch {
        if (!cancelled) {
          setError('No se pudo cargar el historial.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadScans();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="muted">Cargando historial...</p>;
  }

  if (error) {
    return <p className="app-error">{error}</p>;
  }

  if (scans.length === 0) {
    return <p className="muted">Aun no hay scans persistidos.</p>;
  }

  return (
    <div className="app-table">
      <div className="app-table-row head">
        <span>Dominio</span>
        <span>Estado</span>
        <span>Grade</span>
        <span>Riesgo</span>
        <span>Fecha</span>
      </div>
      {scans.map((scan) => (
        <a
          className="app-table-row app-table-link"
          href={`/diagnostico/report/${encodeURIComponent(scan.id)}`}
          key={scan.id}
        >
          <strong>{formatTarget(scan)}</strong>
          <span>{scan.status}</span>
          <span>{scan.grade ?? '-'}</span>
          <span>{scan.riskLevel}</span>
          <span>{formatCreatedAt(scan.createdAt)}</span>
        </a>
      ))}
    </div>
  );
}
