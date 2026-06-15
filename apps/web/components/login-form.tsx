'use client';

import {
  type ActionCodeSettings,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';

import { firebaseAuth } from '../lib/firebase/client';

type AuthMode = 'login' | 'register';

const emailVerificationBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'https://app.sentinelcloud.dev';
  }

  if (window.location.hostname === 'sentinelcloud.dev') {
    return 'https://app.sentinelcloud.dev';
  }

  return window.location.origin;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = useMemo(() => {
    const next = searchParams.get('next');
    return next?.startsWith('/') ? next : '/app';
  }, [searchParams]);
  const emailVerificationActionSettings = useMemo<ActionCodeSettings>(
    () => ({
      handleCodeInApp: false,
      url: `${emailVerificationBaseUrl()}/login?next=${encodeURIComponent(nextPath)}`,
    }),
    [nextPath],
  );

  async function createSession(idToken: string) {
    const response = await fetch('/api/session', {
      body: JSON.stringify({ idToken }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? 'No se pudo iniciar la sesion.');
    }
  }

  async function continueWithVerifiedUser() {
    const currentUser = firebaseAuth.currentUser;

    if (!currentUser) {
      throw new Error('No hay una sesion activa de Firebase.');
    }

    await currentUser.reload();

    if (!currentUser.emailVerified) {
      await sendEmailVerification(currentUser, emailVerificationActionSettings);
      await signOut(firebaseAuth);
      setMessage('Te enviamos un link de verificacion. Revisa tu correo y vuelve a iniciar sesion.');
      return;
    }

    await createSession(await currentUser.getIdToken(true));
    router.push(nextPath);
    router.refresh();
  }

  async function handleEmailAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        await sendEmailVerification(credential.user, emailVerificationActionSettings);
        await signOut(firebaseAuth);
        setMessage('Cuenta creada. Te enviamos un link de verificacion para activar el acceso.');
        return;
      }

      await signInWithEmailAndPassword(firebaseAuth, email, password);
      await continueWithVerifiedUser();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'No se pudo completar el acceso.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleAuth() {
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(firebaseAuth, provider);
      await continueWithVerifiedUser();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'No se pudo completar Google Sign-In.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <a className="auth-brand" href="/">
          <span className="app-brand-eye" />
          <span>Sentinel Cloud</span>
        </a>

        <div className="auth-heading">
          <ShieldCheck size={30} />
          <div>
            <span>app.sentinelcloud.dev</span>
            <h1>{mode === 'login' ? 'Entrar a la consola' : 'Crear cuenta'}</h1>
          </div>
        </div>

        <button className="auth-google" disabled={isSubmitting} onClick={handleGoogleAuth} type="button">
          Continuar con Google
        </button>

        <div className="auth-divider">
          <span />
          <p>o usa tu correo</p>
          <span />
        </div>

        <form className="auth-form" onSubmit={handleEmailAuth}>
          <label>
            Correo
            <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </label>
          <label>
            Contrasena
            <input
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <button className="btn btn-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Registrarme'}
          </button>
        </form>

        {message ? <p className="auth-message">{message}</p> : null}
        {error ? <p className="auth-error">{error}</p> : null}

        <button className="auth-switch" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} type="button">
          {mode === 'login' ? 'Crear cuenta con correo' : 'Ya tengo cuenta'}
        </button>
      </section>
    </main>
  );
}
