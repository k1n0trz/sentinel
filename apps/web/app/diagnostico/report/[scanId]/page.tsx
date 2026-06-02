import { SharedDiagnosticReport } from '../../../../components/shared-diagnostic-report';

export default async function Page({ params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;

  return <SharedDiagnosticReport scanId={scanId} />;
}
