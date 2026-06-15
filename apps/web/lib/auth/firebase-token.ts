type FirebaseUserToken = {
  email?: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  uid: string;
};

type JoseModule = typeof import('jose');
type RemoteJwks = ReturnType<JoseModule['createRemoteJWKSet']>;

let remoteJwks: RemoteJwks | undefined;

const firebaseProjectId = () => {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error('Firebase project id is not configured.');
  }

  return projectId;
};

const optionalString = (value: unknown) =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<FirebaseUserToken> {
  const projectId = firebaseProjectId();
  const { createRemoteJWKSet, jwtVerify } = await import('jose');

  remoteJwks ??= createRemoteJWKSet(
    new URL(
      'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
    ),
  );

  const { payload } = await jwtVerify(idToken, remoteJwks, {
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  });

  if (!payload.sub) {
    throw new Error('Firebase token is missing subject.');
  }

  return {
    email: optionalString(payload.email),
    emailVerified: payload.email_verified === true,
    name: optionalString(payload.name),
    picture: optionalString(payload.picture),
    uid: payload.sub,
  };
}
