import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Gestion-Entrenador';

  loggedIn: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.loggedIn$.subscribe((status) => {
      this.loggedIn = status;

      // Solo redirigir al login si no está logueado y ya no está en la página de login
      if (!this.loggedIn && this.router.url !== '/login') {
        this.router.navigate(['/login']);
      }
    });
  }
}
