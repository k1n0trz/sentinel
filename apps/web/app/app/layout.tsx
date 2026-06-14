import { requireCurrentUser } from '../../lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function PrivateAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireCurrentUser();

  return children;
}
