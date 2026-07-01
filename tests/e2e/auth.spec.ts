// tests/e2e/auth.spec.ts
// Flujos E2E del módulo de autenticación (WEB_TESTING.md §2.3, §4).
//
// Contexto técnico del frontend real (no asumir — verificado en código):
//   - Sesión 100% en memoria (Zustand store sin persistencia). No hay cookies de sesión.
//   - Recargar la página = perder estado → DashboardLayout intenta silentRefresh → si falla, redirect a /login.
//   - No existe botón de logout en el UI todavía (useLogout está definido pero no conectado a ningún componente).
//   - Selectores disponibles: #email, #password, button[type="submit"], [role="alert"], aria-invalid.
//   - No hay data-testid en componentes de auth.

import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from './fixtures';

const { admin } = TEST_CREDENTIALS;

async function scrollIntoView(page: import('@playwright/test').Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
}

test.describe('Autenticación', () => {
  // ─── FLUJOS IMPLEMENTADOS ────────────────────────────────────────────

  test('1. Login válido → redirige al dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#email').fill(admin.email);
    await page.locator('#password').fill(admin.password);

    // Scroll to ensure button is visible (mobile viewport)
    await scrollIntoView(page, 'button[type="submit"]');
    await page.locator('button[type="submit"]').click();

    // El DashboardLayout hace bootstrap (silentRefresh + getMe + check role=admin)
    // Si todo OK, renderiza el dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10_000 });
    await expect(page.locator('h1')).toContainText('Dashboard', { timeout: 10_000 });
  });

  test('2. Login inválido → muestra mensaje de error en el formulario', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#email').fill('noexiste@urbania.com');
    await page.locator('#password').fill('WrongPass123!');

    await scrollIntoView(page, 'button[type="submit"]');
    await page.locator('button[type="submit"]').click();

    // El servidor responde 401 → se muestra [role="alert"] con el mensaje de error
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10_000 });
    // Verificar que seguimos en /login (no hubo redirect)
    await expect(page).toHaveURL('/login');
  });

  test('3. Ruta protegida sin sesión → redirige a /login', async ({ page }) => {
    // Sin cookies ni localStorage → la app arranca sin estado de auth
    await page.context().clearCookies();
    await page.goto('/dashboard');

    // DashboardLayout intenta silentRefresh, falla, redirige a /login
    await expect(page).toHaveURL('/login', { timeout: 10_000 });
  });

  test('4. Sesión expirada (recarga de página) → redirige a /login', async ({ page }) => {
    // 1. Login exitoso
    await page.goto('/login');
    await page.locator('#email').fill(admin.email);
    await page.locator('#password').fill(admin.password);

    await scrollIntoView(page, 'button[type="submit"]');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10_000 });

    // 2. Recargar la página — el estado de sesión (Zustand en memoria) se pierde.
    //    Al montarse de nuevo, DashboardLayout intenta silentRefresh,
    //    pero el refreshToken se perdió → falla → redirect a /login.
    await page.reload();
    await expect(page).toHaveURL('/login', { timeout: 10_000 });
  });

  // ─── FLUJOS PENDIENTES (skip documentado) ─────────────────────────────

  test.skip('5. Logout → limpia sesión y no puede volver al dashboard', async () => {
    // TODO: Implementar cuando exista un botón de logout en el UI.
    // El hook useLogout (src/features/auth/hooks/use-logout.ts) ya está definido
    // pero ningún componente del DashboardShell lo usa todavía.
    // Verificación esperada tras implementar:
    //   1. Login → dashboard
    //   2. Click en botón "Cerrar sesión"
    //   3. URL = /login
    //   4. goto('/dashboard') → URL = /login (sin re-autenticarse)
  });

  test.skip('6. Usuario con role=user (residente) es rechazado → queda en /login', async () => {
    // TODO: Requiere que exista una cuenta de residente en la API de desarrollo.
    // El código (DashboardLayout) verifica user.role === 'admin'.
    // Si role !== 'admin': clearSession() + navigate('/login', { replace: true })
    //   + toast "Acceso no autorizado. Solo administradores."
    // Verificación esperada:
    //   1. Login con resident.email / resident.password
    //   2. URL = /login (no avanza al dashboard)
    //   3. Toast visible: "Acceso no autorizado. Solo administradores."
  });

  test.skip('7. Flujo MFA completo', async () => {
    // TODO: Requiere:
    //   a) Cuenta con MFA habilitado en la API de desarrollo.
    //   b) Secreto TOTP conocido (TEST_MFA_SECRET) para generar código válido.
    //   c) Helper generateTestTotp() para generar código TOTP en tiempo real.
    //      (usar librería `otplib` o implementar RFC 6238 en un helper).
    // Verificación esperada:
    //   1. Login con cuenta MFA → redirect a /login/mfa
    //   2. Ingresar código TOTP generado con secreto conocido
    //   3. URL = /dashboard
  });
});
