// tests/e2e/fixtures.ts
// Credenciales y helpers centralizados para tests E2E.
//
// Uso: import { TEST_CREDENTIALS } from './fixtures';
//
// Variables de entorno (opcional — se heredan del entorno de ejecución):
//   TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD
//   TEST_RESIDENT_EMAIL, TEST_RESIDENT_PASSWORD
//   TEST_MFA_SECRET
//
// Para cargar desde .env.test: instalar dotenv (`pnpm add -D dotenv`) y descomentar la línea:
//   import 'dotenv/config';

export const TEST_CREDENTIALS = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@urbania.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'Admin2026!',
  },
  resident: {
    email: process.env.TEST_RESIDENT_EMAIL || 'residente@urbania.com',
    password: process.env.TEST_RESIDENT_PASSWORD || 'Resident2026!',
  },
  /** Secreto TOTP en Base32 para generar códigos MFA en tests. */
  mfaSecret: process.env.TEST_MFA_SECRET || '',
} as const;
