'use client';

import type { ScanResult } from '@sentinel/shared';
import { Activity, AlertTriangle, CheckCircle2, Globe2, Radar, ShieldCheck, Terminal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { runFreeScan } from '../lib/api';

const severityOrder = ['critical', 'high', 'medium', 'low', 'info'] as const;

export function ScanConsole() {
  const [url, setUrl] = useState('https://example.com');
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const findingsBySeverity = useMemo(() => {
    return severityOrder.map((severity) => ({
      severity,
      findings: scan?.findings.filter((finding) => finding.severity === severity) ?? [],
    }));
  }, [scan]);

  const onScan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      setScan(await runFreeScan({ url }));
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : 'Unable to run scan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-carbon text-white">
      <section className="relative mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-8 px-5 py-6 md:grid-cols-[0.95fr_1.05fr] md:px-8 lg:px-10">
        <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_28%_28%,rgba(47,123,255,0.18),transparent_28%),radial-gradient(circle_at_74%_8%,rgba(255,48,69,0.12),transparent_24%)]" />
        <div className="relative z-10 flex min-h-[92vh] flex-col justify-between py-4">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-electric/40 bg-electric/10">
              <Radar className="h-5 w-5 text-electric" />
            </span>
            Sentinel
          </div>

          <div className="max-w-xl space-y-7">
            <div className="inline-flex items-center gap-2 border border-vigilance/30 bg-vigilance/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-vigilance">
              <Activity className="h-4 w-4" />
              Defensive surface intelligence
            </div>
            <h1 className="text-5xl font-semibold leading-[1.02] text-white md:text-6xl">
              Sentinel watches your surface before threats become incidents.
            </h1>
            <p className="max-w-lg text-base leading-7 text-slate-300">
              Vigilant. Intelligent. Unseen.
            </p>

            <form
              onSubmit={(event) => {
                void onScan(event);
              }}
              className="grid gap-3 sm:grid-cols-[1fr_auto]"
            >
              <label className="sr-only" htmlFor="scan-url">
                Domain URL
              </label>
              <input
                id="scan-url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="h-12 border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-electric"
                placeholder="https://example.com"
                type="url"
                required
              />
              <button
                className="inline-flex h-12 items-center justify-center gap-2 bg-electric px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
                type="submit"
              >
                <Terminal className="h-4 w-4" />
                {isLoading ? 'Scanning' : 'Scan now'}
              </button>
            </form>
            {error ? <p className="border border-vigilance/40 bg-vigilance/10 p-3 text-sm text-red-100">{error}</p> : null}
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-slate-400">
            <span className="border-t border-white/10 pt-3">Passive checks</span>
            <span className="border-t border-white/10 pt-3">Low impact</span>
            <span className="border-t border-white/10 pt-3">Authorized use</span>
          </div>
        </div>

        <div className="relative z-10 flex items-center py-6">
          <div className="w-full border border-white/10 bg-panel/88 p-4 shadow-signal backdrop-blur md:p-5">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Live report</p>
                <h2 className="mt-1 text-xl font-semibold text-white">{scan?.finalUrl ?? 'Awaiting scan'}</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-electric/40 bg-electric/10">
                <Globe2 className="h-6 w-6 text-electric" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Score" value={scan ? `${scan.score}` : '--'} tone="blue" />
              <Metric label="Risk level" value={scan?.riskLevel ?? '--'} tone="red" />
              <Metric label="HTTP status" value={scan?.httpStatus ? `${scan.httpStatus}` : '--'} />
              <Metric label="HTTPS" value={scan ? (scan.https ? 'Enabled' : 'Missing') : '--'} />
              <Metric label="SSL" value={scan?.ssl?.enabled ? 'Detected' : scan ? 'Missing' : '--'} />
              <Metric label="DNS" value={scan?.dns?.addresses.length ? `${scan.dns.addresses.length} A record(s)` : '--'} />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                  <ShieldCheck className="h-4 w-4 text-electric" />
                  Security headers
                </div>
                <div className="space-y-2">
                  {(scan?.headers ?? []).slice(0, 9).map((header) => (
                    <div key={header.name} className="flex items-center justify-between gap-3 text-xs">
                      <span className="truncate text-slate-300">{header.name}</span>
                      {header.present ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-vigilance" />
                      )}
                    </div>
                  ))}
                  {!scan ? <p className="text-sm text-slate-500">Results appear after a passive scan.</p> : null}
                </div>
              </div>

              <div className="border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                  <AlertTriangle className="h-4 w-4 text-vigilance" />
                  Findings
                </div>
                <div className="max-h-80 space-y-3 overflow-auto pr-1">
                  {findingsBySeverity.flatMap(({ severity, findings }) =>
                    findings.map((finding) => (
                      <article key={finding.id} className="border border-white/10 bg-white/[0.03] p-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <h3 className="text-sm font-medium text-white">{finding.title}</h3>
                          <span className="shrink-0 text-xs uppercase text-vigilance">{severity}</span>
                        </div>
                        <p className="text-xs leading-5 text-slate-400">{finding.description}</p>
                        <p className="mt-2 text-xs leading-5 text-slate-300">{finding.recommendation}</p>
                      </article>
                    )),
                  )}
                  {scan && scan.findings.length === 0 ? <p className="text-sm text-emerald-300">No findings detected in this passive scan.</p> : null}
                  {!scan ? <p className="text-sm text-slate-500">Run a scan to see severity-ranked findings.</p> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'blue' | 'red' | 'neutral' }) {
  const color = tone === 'blue' ? 'text-electric' : tone === 'red' ? 'text-vigilance' : 'text-white';

  return (
    <div className="min-h-24 border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-3 break-words text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}
