import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AssistanceComponent } from './components/assistance/assistance.component';
import { FormsModule } from '@angular/forms';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { TrainingsListComponent } from './components/trainings-list/trainings-list.component';
import { GamesListComponent } from './components/games-list/games-list.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { GameMinutesComponent } from './components/game-minutes/game-minutes.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DashboardComponent,
    AssistanceComponent,
    PlayersListComponent,
    TrainingsListComponent,
    GamesListComponent,
    GameMinutesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
