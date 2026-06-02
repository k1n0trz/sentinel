import { StubPage } from '../../components/site-shell';

export default function CaracteristicasPage() {
  return (
    <StubPage
      description="Estamos detallando todas las capacidades de Sentinel: detección inteligente, monitoreo continuo, sandbox visual, reportes accionables y respuesta asistida."
      items={[
        'Detección inteligente',
        'Monitoreo continuo',
        'Sandbox visual',
        'Reportes accionables',
        'Respuesta asistida',
        'Clasificación de riesgo',
        'Auditoría',
        'Integraciones',
      ]}
      title="Características"
    />
  );
}

