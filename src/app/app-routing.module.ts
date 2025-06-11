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

const routes: Routes = [
  { path: 'assistance', component: AssistanceComponent },
  { path: 'players-list', component: PlayersListComponent },
  { path: 'games-list', component: GamesListComponent },
  { path: 'games-minutes', component: GameMinutesComponent },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'restore-password', component: RestorePasswordComponent },
  { path: '**', redirectTo: 'login' }, // Redirigir a login por defecto
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
