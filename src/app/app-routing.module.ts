import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssistanceComponent } from './components/assistance/assistance.component';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { GamesListComponent } from './components/games-list/games-list.component';
import { GameMinutesComponent } from './components/game-minutes/game-minutes.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RestorePasswordComponent } from './components/restore-password/restore-password.component';
import { noAuthGuard } from './guards/no-auth.guard';
import { authGuard } from './guards/auth.guard'; // 👈 Añadir esto

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Rutas públicas
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'restore-password', component: RestorePasswordComponent },

  // Rutas protegidas
  {
    path: 'assistance',
    component: AssistanceComponent,
    canActivate: [authGuard],
  },
  {
    path: 'players-list',
    component: PlayersListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'games-list',
    component: GamesListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'games-minutes',
    component: GameMinutesComponent,
    canActivate: [authGuard],
  },

  // Fallback
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
