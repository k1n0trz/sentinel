'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { firebaseAuth } from '../lib/firebase/client';

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch('/api/session', { method: 'DELETE' });
    await firebaseAuth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button className="btn btn-ghost btn-sm" onClick={handleSignOut} type="button">
      <LogOut size={16} />
      Salir
    </button>
  );
}
