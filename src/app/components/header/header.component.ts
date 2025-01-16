import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  username: string | null = null;
  menuOpen: boolean = false;
  isDarkMode: boolean = false;
  mobileMenuOpen: boolean = false;

  private themeSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Obtener el nombre de usuario
    this.username = this.authService.getUsername();

    // Suscripción al servicio de tema oscuro
    this.themeSubscription = this.themeService.isDarkMode$.subscribe((isDarkMode) => {
      this.isDarkMode = isDarkMode;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  logOut() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Si el clic es fuera del componente, cierra ambos menús
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
      this.mobileMenuOpen = false;
    }
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}
