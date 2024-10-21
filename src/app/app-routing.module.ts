import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssistanceComponent } from './components/assistance/assistance.component';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { TrainingCalendarComponent } from './components/training-calendar/training-calendar.component';

const routes: Routes = [
  { path: 'assistance', component: AssistanceComponent },
  { path: 'players-list', component: PlayersListComponent },
  { path: 'training-calendar', component: TrainingCalendarComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
