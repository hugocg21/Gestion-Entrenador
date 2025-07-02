// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'Gestion-Entrenador';

  loggedIn = false;
  isDarkMode = false;
  hasTeamSelected = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.authService.loggedIn$.subscribe((status: boolean) => {
      this.loggedIn = status;

      // 🟢 Verifica cada vez el equipo seleccionado
      this.hasTeamSelected = !!localStorage.getItem('selectedTeamId');

      if (!status && this.router.url !== '/login') {
        this.router.navigate(['/login']);
      }
    });

    // Escucha también cambios del localStorage por seguridad
    window.addEventListener('storage', () => {
      this.hasTeamSelected = !!localStorage.getItem('selectedTeamId');
    });

    this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
      this.applyTheme();
    });
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
    this.applyTheme();
  }

  private applyTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark', this.isDarkMode);
  }
}
