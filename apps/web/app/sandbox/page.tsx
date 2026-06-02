import { StubPage } from '../../components/site-shell';

export default function SandboxPage() {
  return (
    <StubPage
      description="Prueba tu aplicación en un entorno visual aislado antes de que lo haga un atacante real. La experiencia completa del sandbox llega pronto."
      items={['Navegador aislado', 'Análisis de formularios', 'Timeline de eventos', 'Risk Score', 'Evidencias', 'Recomendaciones']}
      title="Sandbox Visual"
    />
  );
}

