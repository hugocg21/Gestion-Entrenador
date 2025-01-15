import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  username: string | null = null;
  menuOpen: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.username = this.authService.getUsername(); // Obtiene el nombre de usuario al cargar
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen; // Alterna el menú desplegable
  }

  logOut() {
    this.authService.logout(); // Cierra sesión
    this.router.navigate(['/login']); // Redirige al login
  }
}
