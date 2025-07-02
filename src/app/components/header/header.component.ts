import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamSelectionService } from '../../services/team-selection.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  username: string | null = null;
  menuOpen: boolean = false;
  isDarkMode: boolean = false;
  mobileMenuOpen: boolean = false;
  hasTeamSelected = false;

  private themeSubscription!: Subscription;
  private teamSub!: Subscription;
  private routerSub!: Subscription;
  private teamSel = inject(TeamSelectionService);

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    public router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private teamSelectionService: TeamSelectionService
  ) {}

  ngOnInit() {
    this.username = this.authService.getUsername();
    console.log('[Header] Username:', this.username);

    // ⚡️ Suscripción al estado del equipo seleccionado
    this.teamSub = this.teamSel.selectedTeam$.subscribe((has) => {
      this.hasTeamSelected = has;
      console.log('[Header] hasTeamSelected actualiza a:', has);
    });

    // ⚡️ Suscripción al estado del tema
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(
      (isDark) => {
        this.isDarkMode = isDark;
        console.log('[Header] Tema oscuro:', isDark);
      }
    );

    // 🧭 Escuchar eventos del router para verificar navegación
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        console.log('[Header] Navegación detectada:', event.url);
      }
    });

    // Verificación inicial
    const selectedTeam = localStorage.getItem('selectedTeamId');
    console.log('[Header] selectedTeamId en localStorage:', selectedTeam);
  }

  ngOnDestroy() {
    this.teamSub?.unsubscribe();
    this.themeSubscription?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    console.log('[Header] toggleMenu:', this.menuOpen);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    console.log('[Header] toggleMobileMenu:', this.mobileMenuOpen);
  }

  toggleDarkMode() {
    console.log('[Header] toggleDarkMode');
    this.themeService.toggleDarkMode();
  }

  logOut() {
    console.log('[Header] logout');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // 🔍 Navegación manual con trazas (por si sigues usando botones)
  goTo(route: string) {
    console.log('[Header] Navegando a:', route);
    this.router.navigate([route]).then((success) => {
      console.log('[Header] Resultado de navegación:', success);
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
      this.mobileMenuOpen = false;
    }
  }

  goToDashboard(): void {
    this.teamSelectionService.clearSelection();
    this.router.navigate(['/dashboard']);
    this.menuOpen = false;
  }
}
