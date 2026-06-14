import type { NextRequest } from 'next/server';
import { proxyPublicApi } from '../_proxy';

export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest) =>
  proxyPublicApi({
    body: await request.text(),
    method: 'POST',
    path: '/public/scans',
  });
