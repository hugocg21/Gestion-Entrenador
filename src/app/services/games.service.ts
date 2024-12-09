import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Game } from '../models/game.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class GamesService {
  private gamesCollection;

  constructor(private firestore: AngularFirestore) {
    this.gamesCollection = this.firestore.collection<Game>('games');
  }

  // Obtener todos los partidos
  getGames(): Observable<Game[]> {
    return this.gamesCollection.valueChanges({ idField: 'id' });
  }

  addGame(game: Game): Promise<void> {
    return this.firestore.collection('games').doc(game.id.toString()).set(game);
  }

  // Eliminar un partido
  removeGame(gameId: number) {
    const gameRef = this.gamesCollection.doc(gameId.toString());
    return gameRef.delete();
  }

   // Actualizar los minutos en un partido
   updateGame(gameId: number, updatedGame: Game): Promise<void> {
    return this.firestore.collection('games').doc(gameId.toString()).update(updatedGame);
  }
}
