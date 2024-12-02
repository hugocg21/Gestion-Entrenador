import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { Game } from "../models/game.model";
import { AngularFirestore } from "@angular/fire/compat/firestore";

@Injectable({
  providedIn: 'root'
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

  // Añadir un partido
  addGame(game: Game) {
    const gameRef = this.gamesCollection.doc(game.id.toString());
    return gameRef.set(game);
  }

  // Eliminar un partido
  removeGame(gameId: number) {
    const gameRef = this.gamesCollection.doc(gameId.toString());
    return gameRef.delete();
  }
}
