import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Player } from '../models/player.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private playersCollection;
  private trainingDaysCollection;

  constructor(private firestore: AngularFirestore) {
    this.playersCollection = this.firestore.collection<Player>('players');
    this.trainingDaysCollection = this.firestore.collection<{ date: string }>('trainingDays');
  }

  getPlayers(): Observable<Player[]> {
    return this.firestore.collection<Player>('players').valueChanges({ idField: 'id' });
  }

  getPlayerById(playerId: string): Observable<Player> {
    return this.firestore
      .collection('players')
      .doc(playerId)
      .valueChanges() as Observable<Player>;
  }

  getTrainingDays(): Observable<{ date: string }[]> {
    return this.trainingDaysCollection.valueChanges();
  }

  addPlayer(player: Player) {
    const playerRef = this.playersCollection.doc(player.id.toString());
    return playerRef.set(player);
  }

  removePlayer(playerId: number) {
    const playerRef = this.playersCollection.doc(playerId.toString());
    return playerRef.delete();
  }

  updatePlayer(updatedPlayer: Player) {
    const playerRef = this.playersCollection.doc(updatedPlayer.id.toString());
    return playerRef.update(updatedPlayer);
  }

  updatePlayerAttendance(playerId: number, date: string, attended: boolean) {
    const playerRef = this.playersCollection.doc(playerId.toString());
    return playerRef.update({ [`attendance.${date}`]: attended });
  }

  updateTrainingStatus(date: string) {
    const trainingRef = this.trainingDaysCollection.doc(date);
    return trainingRef.set({ date });
  }

  updatePlayerGameMinutes(playerId: string, gameId: string, stats: {
    minutes: number;
    points: number;
    fouls: number;
    freeThrows: { made: number; attempted: number };
    efficiency: number;
  }): Promise<void> {
    // Asegurarse de que no haya valores undefined en los datos
    Object.keys(stats).forEach((key) => {
      if (key === 'minutes') {
        stats.minutes = stats.minutes || 0;
      } else if (key === 'points') {
        stats.points = stats.points || 0;
      } else if (key === 'fouls') {
        stats.fouls = stats.fouls || 0;
      } else if (key === 'freeThrows') {
        stats.freeThrows = stats.freeThrows || { made: 0, attempted: 0 };
        stats.freeThrows.made = stats.freeThrows.made || 0;
        stats.freeThrows.attempted = stats.freeThrows.attempted || 0;
      } else if (key === 'efficiency') {
        stats.efficiency = stats.efficiency || 0;
      }
    });

    // Actualizar las estadísticas del jugador en Firestore
    return this.firestore
      .collection('players')
      .doc(playerId)
      .update({ [`gameMinutes.${gameId}`]: stats });
  }

}
