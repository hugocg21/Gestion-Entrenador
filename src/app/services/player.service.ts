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

  updatePlayerGameMinutes(playerId: string, gameId: string, minutes: number): Promise<void> {
    return this.firestore.collection('players').doc(playerId).update({ [`gameMinutes.${gameId}`]: minutes });
  }
}
