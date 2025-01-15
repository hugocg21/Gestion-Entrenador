import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Game } from '../models/game.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class GamesService {
  constructor(private firestore: AngularFirestore, private authService: AuthService) {}

  // Obtener la colección de juegos del usuario actual
  private getUserGamesCollection() {
    const username = this.authService.getUsername();
    if (!username) {
      throw new Error('User is not authenticated or username is missing.');
    }
    return this.firestore.collection<Game>(`users/${username}/games`);
  }

  // Obtener todos los juegos
  getGames(): Observable<Game[]> {
    return this.getUserGamesCollection().valueChanges({ idField: 'id' });
  }

  // Añadir un nuevo juego (usando el nombre del oponente como ID)
  addGame(game: Game): Promise<void> {
    const username = this.authService.getUsername();
    if (!username) {
      throw new Error('User is not authenticated or username is missing.');
    }

    // Normalizamos el nombre del oponente para usarlo como ID
    const gameId = game.opponent.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(); // Reemplaza caracteres especiales por "_"

    return this.firestore
      .collection(`users/${username}/games`)
      .doc(gameId)
      .set(game);
  }

  // Eliminar un juego por el nombre del oponente
  removeGame(opponent: string): Promise<void> {
    const username = this.authService.getUsername();
    if (!username) {
      throw new Error('User is not authenticated or username is missing.');
    }

    const gameId = opponent.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    return this.firestore
      .collection(`users/${username}/games`)
      .doc(gameId)
      .delete();
  }

  // Actualizar un juego existente (usando el nombre del oponente como ID)
  updateGame(opponent: string, updatedGame: Game): Promise<void> {
    const username = this.authService.getUsername();
    if (!username) {
      throw new Error('User is not authenticated or username is missing.');
    }

    const gameId = opponent.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    return this.firestore
      .collection(`users/${username}/games`)
      .doc(gameId)
      .update(updatedGame);
  }

  // Actualizar estadísticas de un jugador en un juego
  updateGamePlayerStats(
    opponent: string,
    playerId: string,
    stats: {
      minutes: number;
      points: number;
      fouls: number;
      freeThrows: { made: number; attempted: number };
      efficiency: number;
    }
  ): Promise<void> {
    const username = this.authService.getUsername();
    if (!username) {
      throw new Error('User is not authenticated or username is missing.');
    }

    const gameId = opponent.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    return this.firestore
      .collection(`users/${username}/games`)
      .doc(gameId)
      .update({
        [`playerStats.${playerId}`]: stats, // Guardar estadísticas bajo el ID del jugador
      });
  }
}
