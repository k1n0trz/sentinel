import { StubPage } from '../../components/site-shell';

export default function RecursosPage() {
  return (
    <StubPage
      description="Blog, casos de uso, documentación y centro de ayuda sobre seguridad e IA. Estamos preparando el contenido."
      items={['Seguridad para startups', 'IA + ciberseguridad', 'Sandbox testing', 'Protección de APIs', 'Buenas prácticas', 'Respuesta a incidentes']}
      title="Recursos"
    />
  );
}

