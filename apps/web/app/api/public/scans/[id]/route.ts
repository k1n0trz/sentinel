import { proxyPublicApi } from '../../_proxy';

export const dynamic = 'force-dynamic';

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  return proxyPublicApi({
    method: 'GET',
    path: `/public/scans/${encodeURIComponent(id)}`,
  });
};
