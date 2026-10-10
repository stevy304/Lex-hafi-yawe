import { AuthService } from './types';
import { RestAuthService } from './rest';
import { MockAuthService } from './mock';
import { FirebaseAuthService } from './firebase';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {}) as any;
const provider = (env.VITE_AUTH_PROVIDER || 'mock').toLowerCase();

let serviceInstance: AuthService;

if (provider === 'rest') {
  serviceInstance = new RestAuthService();
} else if (provider === 'firebase') {
  serviceInstance = new FirebaseAuthService();
} else {
  serviceInstance = new MockAuthService();
}

export const authService: AuthService = serviceInstance;
export * from './types';
export * from './safeRedirect';
export * from './phone';
export * from './google';
