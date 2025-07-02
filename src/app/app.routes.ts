import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RestorePasswordComponent } from './components/restore-password/restore-password.component';
import { noAuthGuard } from './guards/no-auth.guard';
import { authGuard } from './guards/auth.guard';
import { provideFirestore } from '@angular/fire/firestore';
import { getFirestore } from 'firebase/firestore';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Rutas públicas
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'restore-password', component: RestorePasswordComponent },

  // Dashboard: selección de equipo
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/team-dashboard/team-dashboard.component').then(
        (m) => m.TeamDashboardComponent
      ),
    canActivate: [authGuard],
  },

  // App: layout con subrutas protegidas
  {
    path: 'app',
    loadComponent: () =>
      import('./components/team-layout/team-layout.component').then(
        (m) => m.TeamLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'players-list', pathMatch: 'full' },
      {
        path: 'assistance',
        loadComponent: () =>
          import('./components/assistance/assistance.component').then(
            (m) => m.AssistanceComponent
          ),
      },
      {
        path: 'players-list',
        loadComponent: () =>
          import('./components/players-list/players-list.component').then(
            (m) => m.PlayersListComponent
          ),
      },
      {
        path: 'game-list',
        loadComponent: () =>
          import('./components/game-list/game-list.component').then(
            (m) => m.GameListComponent
          ),
      },
      {
        path: 'games',
        loadComponent: () =>
          import('./components/games/games.component').then(
            (m) => m.GamesComponent
          ),
      },
      {
        path: 'stats',
        loadComponent: () =>
          import('./components/stats-summary/stats-summary.component').then(
            (m) => m.StatsSummaryComponent
          ),
        providers: [
          provideFirestore(() => getFirestore()), // <- esto es experimental, pero válido en standalone
        ],
      },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'login' },
];
