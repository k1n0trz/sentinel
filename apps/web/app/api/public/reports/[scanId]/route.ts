import { proxyPublicApi } from '../../_proxy';

export const dynamic = 'force-dynamic';

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ scanId: string }> },
) => {
  const { scanId } = await params;

  return proxyPublicApi({
    method: 'GET',
    path: `/public/reports/${encodeURIComponent(scanId)}`,
  });
};
