import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { env } from './env';

export function getFirebaseAuth() {
  if (!getApps().length && env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey) {
    initializeApp({
      credential: cert({
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey: env.firebasePrivateKey,
      }),
      storageBucket: env.firebaseStorageBucket || undefined,
    });
  }

  return getAuth();
}

export function getFirebaseStorage() {
  if (!getApps().length) {
    getFirebaseAuth();
  }

  return getStorage();
}
