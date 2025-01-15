import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Player } from '../models/player.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  constructor(private firestore: AngularFirestore, private authService: AuthService) {}

  // Obtener la colección de jugadores para el usuario actual
  private getUserPlayersCollection() {
    const username = this.authService.getUsername();
    if (!username) {
      throw new Error('User is not authenticated or username is missing.');
    }
    return this.firestore.collection<Player>(`users/${username}/players`);
  }

  // Obtener todos los jugadores
  getPlayers(): Observable<Player[]> {
    return this.getUserPlayersCollection().valueChanges({ idField: 'id' });
  }

  // Obtener un jugador por ID
  getPlayerById(playerId: string): Observable<Player> {
    const username = this.authService.getUsername();
    if (!username) {
      throw new Error('User is not authenticated or username is missing.');
    }
    return this.firestore
      .collection(`users/${username}/players`)
      .doc(playerId)
      .valueChanges() as Observable<Player>;
  }

  // Añadir un jugador
  addPlayer(player: Player): Promise<void> {
    const collection = this.getUserPlayersCollection();
    return collection.doc(player.firstName).set(player); // Usa el nombre como ID
  }

  // Eliminar un jugador
  removePlayer(playerId: string): Promise<void> {
    const collection = this.getUserPlayersCollection();
    return collection.doc(playerId).delete();
  }

  // Actualizar datos de un jugador
  updatePlayer(player: Player): Promise<void> {
    const collection = this.getUserPlayersCollection();
    return collection.doc(player.firstName).update(player);
  }

  // Actualizar la asistencia de un jugador a un entrenamiento
  updatePlayerAttendance(playerId: string, date: string, attended: boolean): Promise<void> {
    const username = this.authService.getUsername();
    if (!username) {
      throw new Error('User is not authenticated or username is missing.');
    }
    return this.firestore
      .collection(`users/${username}/players`)
      .doc(playerId)
      .update({ [`attendance.${date}`]: attended });
  }

  // Actualizar el estado de un entrenamiento
  updateTrainingStatus(date: string): Promise<void> {
    const username = this.authService.getUsername();
    if (!username) {
      throw new Error('User is not authenticated or username is missing.');
    }
    return this.firestore.collection(`users/${username}/trainingDays`).doc(date).set({ date });
  }

  // Actualizar los minutos de un jugador en un partido
  updatePlayerGameMinutes(playerId: string, opponent: string, stats: {
    minutes: number;
    points: number;
    fouls: number;
    freeThrows: { made: number; attempted: number };
    efficiency: number;
}): Promise<void> {
    const username = this.authService.getUsername();
    if (!username) {
        throw new Error('User is not authenticated or username is missing.');
    }

    // Reemplazar caracteres especiales en el nombre del oponente
    const sanitizedOpponent = opponent.replace(/\./g, '').replace(/\s+/g, ' ');

    return this.firestore
        .collection(`users/${username}/players`)
        .doc(playerId)
        .update({ [`gameMinutes.${sanitizedOpponent}`]: stats });
}


}
