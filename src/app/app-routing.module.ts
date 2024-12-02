import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssistanceComponent } from './components/assistance/assistance.component';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { TrainingsListComponent } from './components/trainings-list/trainings-list.component';
import { GamesListComponent } from './components/games-list/games-list.component';

const routes: Routes = [
  { path: 'assistance', component: AssistanceComponent },
  { path: 'players-list', component: PlayersListComponent },
  { path: 'trainings-list', component: TrainingsListComponent },
  { path: 'games-list', component: GamesListComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
