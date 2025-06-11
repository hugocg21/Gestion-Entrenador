import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe(); // Limpia la suscripción

      if (user) {
        resolve(true); // ✅ Usuario autenticado
      } else {
        router.navigate(['/login']); // 🔒 Redirige al login
        resolve(false);
      }
    });
  });
};
