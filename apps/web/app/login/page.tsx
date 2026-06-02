import { StubPage } from '../../components/site-shell';

export default function LoginPage() {
  return (
    <StubPage
      description="El acceso a la consola profesional de Sentinel estará disponible muy pronto. Mientras tanto, agenda una demo para conocer la plataforma."
      items={['Email + contraseña', 'Login con Google', 'Recuperar acceso', 'Crear cuenta']}
      title="Iniciar sesión"
    />
  );
}

