import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AngularFireAuth);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    const sub = auth.authState.subscribe((user) => {
      sub.unsubscribe();
      if (user) {
        router.navigate(['/select-league']);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};
