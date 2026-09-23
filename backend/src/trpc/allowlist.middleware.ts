import { TRPCError } from '@trpc/server';
import { middleware, procedure } from './trpc.js';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const isDevAllowedMiddleware = middleware(async ({ ctx, next }) => {
  const user = ctx.user; // Inyectado desde el contexto de Firebase Auth
  
  if (!user || !user.email) {
    throw new TRPCError({ 
      code: 'UNAUTHORIZED', 
      message: 'No autenticado o sin correo electrónico válido.' 
    });
  }

  // Si estamos en entorno de producción, omitimos la allowlist de beta
  const environment = process.env.NODE_ENV || 'development';
  if (environment === 'production') {
    return next({ ctx });
  }

  // Verificación en la colección allowed_beta_users de Firestore
  const docRef = db.collection('allowed_beta_users').doc(user.email.toLowerCase());
  const docSnap = await docRef.get();

  if (!docSnap.exists || !docSnap.data()?.active) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Acceso restringido. El correo ${user.email} no está autorizado en la beta de dev.thetavlo.com`
    });
  }

  return next({
    ctx: {
      ...ctx,
      betaUser: docSnap.data(),
    },
  });
});

export const protectedDevProcedure = procedure.use(isDevAllowedMiddleware);