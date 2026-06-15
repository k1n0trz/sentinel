'use client';

import { useEffect, useState } from 'react';

type UserProject = {
  id: string;
  name: string;
  description?: string;
  domainCount: number;
  averageScore?: number;
  createdAt: string;
};

type ProjectsResponse = {
  projects?: UserProject[];
  error?: string;
};

export function PrivateProjects() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<UserProject[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        const response = await fetch('/api/app/projects', {
          cache: 'no-store',
        });
        const data = (await response.json()) as ProjectsResponse;

        if (cancelled) return;

        if (!response.ok) {
          setError(data.error ?? 'No se pudieron cargar los proyectos.');
          return;
        }

        setProjects(data.projects ?? []);
      } catch {
        if (!cancelled) {
          setError('No se pudieron cargar los proyectos.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="muted app-panel-state">Cargando proyectos...</p>;
  }

  if (error) {
    return <p className="app-error">{error}</p>;
  }

  if (projects.length === 0) {
    return <p className="muted app-panel-state">Aun no hay proyectos activos.</p>;
  }

  return (
    <div className="app-table">
      <div className="app-table-row head">
        <span>Proyecto</span>
        <span>Plan</span>
        <span>Dominios</span>
        <span>Score</span>
        <span>Estado</span>
      </div>
      {projects.map((project) => (
        <div className="app-table-row" key={project.id}>
          <strong>{project.name}</strong>
          <span>Free</span>
          <span>{project.domainCount}</span>
          <span>
            {typeof project.averageScore === 'number'
              ? `${project.averageScore}/100`
              : '-'}
          </span>
          <span>{project.domainCount > 0 ? 'Activo' : 'Sin dominios'}</span>
        </div>
      ))}
    </div>
  );
}
