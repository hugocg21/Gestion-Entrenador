import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Firebase compat (para apps NO standalone)
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';

// Tus componentes
import { HeaderComponent } from './components/header/header.component';
import { AssistanceComponent } from './components/assistance/assistance.component';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { GamesListComponent } from './components/games-list/games-list.component';
import { GameMinutesComponent } from './components/game-minutes/game-minutes.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RestorePasswordComponent } from './components/restore-password/restore-password.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AssistanceComponent,
    PlayersListComponent,
    GamesListComponent,
    GameMinutesComponent,
    LoginComponent,
    RegisterComponent,
    RestorePasswordComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
