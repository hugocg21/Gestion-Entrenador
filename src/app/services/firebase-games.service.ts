import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  CollectionReference,
  DocumentData,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FirebaseGamesService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  // Reutilizable para acceder a la colección de juegos del equipo seleccionado
  private getGamesCollection(): CollectionReference<DocumentData> {
    const username = this.authService.getUsername();
    const teamId = localStorage.getItem('selectedTeamId');

    if (!username || !teamId) {
      throw new Error('Usuario o equipo no seleccionados');
    }

    return collection(
      this.firestore,
      `users/${username}/teams/${teamId}/games`
    );
  }

  getGames() {
    return collectionData(this.getGamesCollection(), { idField: 'id' });
  }

  async saveGame(game: any) {
    return await addDoc(this.getGamesCollection(), game);
  }

  async updateGame(id: string, game: any) {
    const gameRef = this.getGameDocRef(id);
    return updateDoc(gameRef, game);
  }

  async deleteGame(id: string) {
    const gameRef = this.getGameDocRef(id);
    return deleteDoc(gameRef);
  }

  async getGameById(id: string) {
    const gameRef = this.getGameDocRef(id);
    const snap = await getDoc(gameRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  // 🔁 Utilidad privada para acceder directamente al documento
  private getGameDocRef(id: string) {
    const username = this.authService.getUsername();
    const teamId = localStorage.getItem('selectedTeamId');

    if (!username || !teamId) {
      throw new Error('Usuario o equipo no seleccionados');
    }

    return doc(this.firestore, `users/${username}/teams/${teamId}/games/${id}`);
  }
}
