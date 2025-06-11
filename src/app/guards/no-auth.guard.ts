import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';

export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();

      if (user) {
        router.navigate(['/players-list']); // 👈 Redirige si ya está logueado
        resolve(false);
      } else {
        resolve(true); // ✅ Permite acceso si no está autenticado
      }
    });
  });
};
