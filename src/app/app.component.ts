import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { ThemeService } from './services/theme.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Gestion-Entrenador';

  loggedIn: boolean = false;

  constructor(private authService: AuthService, private router: Router, private themeService: ThemeService) {}

  ngOnInit() {
    this.authService.loggedIn$.subscribe((status) => {
      this.loggedIn = status;

      // Solo redirigir al login si no está logueado y ya no está en la página de login
      if (!this.loggedIn && this.router.url !== '/login') {
        this.router.navigate(['/login']);
      }
    });

    this.themeService.isDarkMode$.subscribe((isDarkMode) => {
      this.isDarkMode = isDarkMode;
    });
  }

  isDarkMode: boolean = false;

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode)); // Guardar preferencia
    this.applyTheme();
  }

  applyTheme() {
    const html = document.documentElement;
    if (this.isDarkMode) {
      html.classList.add('dark'); // Agregar clase `dark`
    } else {
      html.classList.remove('dark'); // Quitar clase `dark`
    }
  }
}
