import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  CollectionReference,
  docData,
  getDocs,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Player } from '../models/player.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  /* 🔑  Ruta dinámica: users/{username}/teams/{teamId}/players */
  private playersCol(): CollectionReference<DocumentData> {
    const username = this.authService.getUsername();
    const teamId = localStorage.getItem('selectedTeamId');
    if (!username || !teamId)
      throw new Error('Usuario o equipo no seleccionado');
    return collection(
      this.firestore,
      `users/${username}/teams/${teamId}/players`
    );
  }

  /* 🟢 CRUD BÁSICO ---------------------------------------------------------- */

  getPlayers(): Observable<Player[]> {
    return collectionData(this.playersCol(), { idField: 'id' }) as Observable<
      Player[]
    >;
  }

  getPlayerById(playerId: string): Observable<Player> {
    const docRef = doc(this.firestore, `${this.playersCol().path}/${playerId}`);
    return docData(docRef, { idField: 'id' }) as Observable<Player>;
  }

  addPlayer(player: Player): Promise<void> {
    const docRef = doc(
      this.firestore,
      `${this.playersCol().path}/${player.id}`
    );
    return setDoc(docRef, player);
  }

  updatePlayer(player: Partial<Player> & { id: string }): Promise<void> {
    const docRef = doc(
      this.firestore,
      `${this.playersCol().path}/${player.id}`
    );
    return updateDoc(docRef, player);
  }

  removePlayer(playerId: string): Promise<void> {
    const docRef = doc(this.firestore, `${this.playersCol().path}/${playerId}`);
    return deleteDoc(docRef);
  }

  /* 🟡 Campos anidados ------------------------------------------------------ */

  updatePlayerAttendance(
    playerId: string,
    date: string,
    attended: boolean
  ): Promise<void> {
    const docRef = doc(this.firestore, `${this.playersCol().path}/${playerId}`);
    return updateDoc(docRef, { [`attendance.${date}`]: attended });
  }

  updatePlayerGameMinutes(
    playerId: string,
    opponent: string,
    stats: {
      minutes: number;
      points: number;
      fouls: number;
      freeThrows: { made: number; attempted: number };
      efficiency: number;
    }
  ): Promise<void> {
    const sanitizedOpp = opponent.replace(/\./g, '').replace(/\s+/g, ' ');
    const docRef = doc(this.firestore, `${this.playersCol().path}/${playerId}`);
    return updateDoc(docRef, { [`gameMinutes.${sanitizedOpp}`]: stats });
  }

  /* 🔵 Exportación ---------------------------------------------------------- */
  async exportAllPlayers(): Promise<any[]> {
    const snap = await getDocs(this.playersCol());
    const players: any[] = [];
    snap.forEach((d) => players.push({ id: d.id, ...d.data() }));
    return players;
  }

  private getUserPlayersCollection(): CollectionReference<DocumentData> {
    const username = this.authService.getUsername();
    if (!username) {
      throw new Error('User is not authenticated or username is missing.');
    }
    return collection(this.firestore, `users/${username}/players`);
  }

  updateTrainingStatus(date: string): Promise<void> {
    const username = this.authService.getUsername();
    if (!username) throw new Error('User not authenticated');
    const trainingDoc = doc(
      this.firestore,
      `users/${username}/trainingDays/${date}`
    );
    return setDoc(trainingDoc, { date });
  }

  // getPlayers(): Observable<Player[]> {
  //   return collectionData(this.getUserPlayersCollection(), {
  //     idField: 'id',
  //   }) as Observable<Player[]>;
  // }

  // getPlayerById(playerId: string): Observable<Player> {
  //   const username = this.authService.getUsername();
  //   if (!username) throw new Error('User not authenticated');
  //   const playerDoc = doc(
  //     this.firestore,
  //     `users/${username}/players/${playerId}`
  //   );
  //   return docData(playerDoc, { idField: 'id' }) as Observable<Player>;
  // }

  // addPlayer(player: Player): Promise<void> {
  //   const username = this.authService.getUsername();
  //   if (!username) throw new Error('User not authenticated');
  //   const playerDoc = doc(
  //     this.firestore,
  //     `users/${username}/players/${player.firstName}`
  //   );
  //   return setDoc(playerDoc, player);
  // }

  // removePlayer(playerId: string): Promise<void> {
  //   const username = this.authService.getUsername();
  //   if (!username) throw new Error('User not authenticated');
  //   const playerDoc = doc(
  //     this.firestore,
  //     `users/${username}/players/${playerId}`
  //   );
  //   return deleteDoc(playerDoc);
  // }

  // updatePlayer(player: Player): Promise<void> {
  //   const username = this.authService.getUsername();
  //   if (!username) throw new Error('User not authenticated');
  //   const playerDoc = doc(
  //     this.firestore,
  //     `users/${username}/players/${player.firstName}`
  //   );
  //   return updateDoc(playerDoc, { ...player });
  // }

  // updatePlayerAttendance(
  //   playerId: string,
  //   date: string,
  //   attended: boolean
  // ): Promise<void> {
  //   const username = this.authService.getUsername();
  //   if (!username) throw new Error('User not authenticated');
  //   const playerDoc = doc(
  //     this.firestore,
  //     `users/${username}/players/${playerId}`
  //   );
  //   return updateDoc(playerDoc, { [`attendance.${date}`]: attended });
  // }

  // updatePlayerGameMinutes(
  //   playerId: string,
  //   opponent: string,
  //   stats: {
  //     minutes: number;
  //     points: number;
  //     fouls: number;
  //     freeThrows: { made: number; attempted: number };
  //     efficiency: number;
  //   }
  // ): Promise<void> {
  //   const username = this.authService.getUsername();
  //   if (!username) throw new Error('User not authenticated');

  //   const sanitizedOpponent = opponent.replace(/\./g, '').replace(/\s+/g, ' ');
  //   const playerDoc = doc(
  //     this.firestore,
  //     `users/${username}/players/${playerId}`
  //   );
  //   return updateDoc(playerDoc, {
  //     [`gameMinutes.${sanitizedOpponent}`]: stats,
  //   });
  // }

  // async exportAllPlayers(): Promise<any[]> {
  //   const username = this.authService.getUsername();
  //   if (!username) throw new Error('Usuario no autenticado');

  //   const snapshot = await getDocs(
  //     collection(this.firestore, `users/${username}/players`)
  //   );

  //   const players: any[] = [];
  //   snapshot.forEach((doc) => {
  //     players.push({ id: doc.id, ...doc.data() });
  //   });

  //   return players;
  // }
}
