'use client';

import type { ScanResult } from '@sentinel/shared';
import { useEffect, useState } from 'react';
import { getPublicScan } from '../lib/api';
import { DiagnosticReport } from './diagnostic-page';
import { SiteFooter, SiteHeader } from './site-shell';

export function SharedDiagnosticReport({ scanId }: { scanId: string }) {
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadScan = async () => {
      try {
        const result = await getPublicScan(scanId);
        if (active) setScan(result);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el reporte.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadScan();

    return () => {
      active = false;
    };
  }, [scanId]);

  return (
    <>
      <SiteHeader />
      <main className="diagnostic-page shared-report-page">
        <section className="diagnostic-hero wrap">
          <div className="diagnostic-copy">
            <span className="eyebrow">Reporte compartible</span>
            <h1>
              Diagnóstico Sentinel <span className="accent">guardado</span>.
            </h1>
            <p>
              Este reporte se carga por ID desde el endpoint público. No existe listado público de resultados ni ranking
              de dominios escaneados.
            </p>
          </div>
          <div className="diagnostic-form shared-report-status">
            <label>Estado</label>
            <strong>{isLoading ? 'Cargando reporte' : scan ? 'Reporte disponible' : 'Reporte no encontrado'}</strong>
            {error ? <div className="error-note">{error}</div> : null}
            <a className="btn btn-primary" href="/diagnostico">
              Nuevo diagnóstico
            </a>
          </div>
        </section>
        <DiagnosticReport scan={scan} />
      </main>
      <SiteFooter />
    </>
  );
}
