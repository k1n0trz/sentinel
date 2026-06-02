import { StubPage } from '../../components/site-shell';

export default function PreciosPage() {
  return (
    <StubPage
      description="Planes para proteger desde una app pequeña hasta una operación crítica: Starter, Business, Pro y Enterprise. La página completa con comparativa y FAQ llega pronto."
      items={['Starter · $19/mes', 'Business · $49/mes', 'Pro · $99/mes', 'Enterprise · Custom', 'Toggle mensual/anual', 'FAQ']}
      title="Precios"
    />
  );
}

