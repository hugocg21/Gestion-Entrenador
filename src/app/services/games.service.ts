// src/app/services/games.service.ts
import { inject, Injectable } from '@angular/core';
import axios from 'axios';

import {
  Firestore, // ✅ de @angular/fire/firestore
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  collectionData,
} from '@angular/fire/firestore'; // ← aquí también

import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GamesService {
  /* --- Backend (Render) solo para procesar Excel ------------------------- */
  private readonly API_URL = 'https://n1tracker-backend.onrender.com';
  BASE_URL = 'https://n1tracker-backend.onrender.com';

  /* --- Firestore -------------------------------------------------------- */
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  /* ---------------------------------------------------------------------- */
  /* 🔸  UTILIDADES PRIVADAS                                                */
  /* ---------------------------------------------------------------------- */

  /** username logueado o `null` */
  private username(): string | null {
    return this.authService.getUsername?.() ?? null;
  }

  /** id de equipo seleccionado o `null` */
  private teamId(): string | null {
    return localStorage.getItem('selectedTeamId');
  }

  /** path a la colección `games` del equipo seleccionado en Firestore */
  private gamesColPath(): string {
    const u = this.username();
    const t = this.teamId();
    if (!u || !t) throw new Error('Usuario o equipo no seleccionado');
    return `users/${u}/teams/${t}/games`;
  }

  constructor() {}

  /* ---------------------------------------------------------------------- */
  /* 🔹  LECTURA EN FIRESTORE                                               */
  /* ---------------------------------------------------------------------- */

  getGames(): Observable<any[]> {
    return collectionData(collection(this.firestore, this.gamesColPath()), {
      idField: 'id',
    }) as Observable<any[]>;
  }

  /* ---------------------------------------------------------------------- */
  /* 🔸  CRUD EN FIRESTORE                                                  */
  /* ---------------------------------------------------------------------- */

  async saveGame(game: any): Promise<void> {
    await addDoc(collection(this.firestore, this.gamesColPath()), game);
  }

  async updateGame(id: string, game: any): Promise<void> {
    await updateDoc(doc(this.firestore, `${this.gamesColPath()}/${id}`), game);
  }

  async deleteGame(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `${this.gamesColPath()}/${id}`));
  }

  /* ---------------------------------------------------------------------- */
  /* 🛰️  PETICIONES AL BACKEND (Render)                                    */
  /* ---------------------------------------------------------------------- */

  /** POST /partidos (incluye username & teamId) */
  guardarPartido(partido: any) {
    const username = this.username();
    const teamId = this.teamId();
    if (!username || !teamId) {
      return Promise.reject('Faltan username o teamId');
    }
    return axios.post(`${this.API_URL}/partidos`, {
      username,
      teamId,
      ...partido,
    });
  }

  /** PUT /partidos/:id (incluye username & teamId) */
  actualizarPartido(partido: any) {
    const username = this.username();
    const teamId = this.teamId();
    if (!username || !teamId) {
      return Promise.reject('Faltan username o teamId');
    }
    return axios.put(`${this.API_URL}/partidos/${partido.id}`, {
      username,
      teamId,
      ...partido,
    });
  }

  /** DELETE /partidos/:id (envía username & teamId en cuerpo) */
  eliminarPartido(id: string) {
    const username = this.username();
    const teamId = this.teamId();
    if (!username || !teamId) {
      return Promise.reject('Faltan username o teamId');
    }
    return axios.delete(`${this.API_URL}/partidos/${id}`, {
      data: { username, teamId },
    });
  }

  /* ---------------------------------------------------------------------- */
  /* 🔧  OTRAS UTILIDADES                                                   */
  /* ---------------------------------------------------------------------- */
  getPartidos(): Promise<any[]> {
    return axios.get(`${this.API_URL}/partidos`).then((res) =>
      res.data.sort((a: any, b: any) => {
        return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      })
    );
  }

  async getEstadisticasAcumuladas() {
    const username = localStorage.getItem('username');
    const teamId = localStorage.getItem('selectedTeamId');

    const res = await axios.get(`${this.API_URL}/estadisticas/acumuladas`, {
      params: { username, teamId },
    });
    return res.data;
  }

  parsearResultado(
    resultado: string
  ): string | { estudiantes: number; rival: number } {
    if (resultado.includes('-')) {
      const [est, riv] = resultado.split('-').map((p) => parseInt(p.trim()));
      return { estudiantes: est, rival: riv };
    }
    return resultado;
  }

  formatMinutos(segundos: number): string {
    return `${Math.floor(segundos / 60)
      .toString()
      .padStart(2, '0')}:${Math.floor(segundos % 60)
      .toString()
      .padStart(2, '0')}`;
  }

  minutosASegundos(min: string): number {
    if (!min || typeof min !== 'string') return 0;
    const [m, s] = min.split(':').map((n) => parseInt(n));
    return (m || 0) * 60 + (s || 0);
  }

  aciertosPorcentaje(valor: string): number {
    if (!valor || !valor.includes('/')) return 0;
    const [aciertos, intentos] = valor.split('/').map((n) => parseInt(n));
    if (!intentos || intentos === 0) return 0;
    return aciertos / intentos;
  }

  calcularTotales(jugador: any[]): any {
    const total = {
      puntos: 0,
      tiros_2p: 0,
      triples: 0,
      tiros_libres: 0,
      faltas_cometidas: 0,
      valoracion: 0,
      segundos: 0,
    };

    for (const j of jugador) {
      total.puntos += +j.puntos || 0;
      total.tiros_2p += parseInt((j.tiros_2p || '0/0').split('/')[0]) || 0;
      total.triples += parseInt((j.triples || '0/0').split('/')[0]) || 0;
      total.tiros_libres +=
        parseInt((j.tiros_libres || '0/0').split('/')[0]) || 0;
      total.faltas_cometidas += +j.faltas_cometidas || 0;
      total.valoracion += +j.valoracion || 0;
      const [min, sec] = (j.minutos || '00:00').split(':').map(Number);
      total.segundos += (min || 0) * 60 + (sec || 0);
    }

    const partidos = jugador.length;
    return {
      ...total,
      partidos,
      prom_puntos: (total.puntos / partidos).toFixed(2),
      prom_t2: (total.tiros_2p / partidos).toFixed(2),
      prom_t3: (total.triples / partidos).toFixed(2),
      prom_tl: (total.tiros_libres / partidos).toFixed(2),
      prom_faltas: (total.faltas_cometidas / partidos).toFixed(2),
      prom_valoracion: (total.valoracion / partidos).toFixed(2),
      prom_minutos: `${String(
        Math.floor(total.segundos / partidos / 60)
      ).padStart(2, '0')}:${String(
        Math.floor((total.segundos / partidos) % 60)
      ).padStart(2, '0')}`,
    };
  }

  // src/app/services/games.service.ts
  async getPartidosJugador(nombre: string): Promise<any[]> {
    const username = this.username();
    const teamId = this.teamId();

    // Traemos TODOS los partidos del equipo, igual que en /partidos
    const res = await axios.get(`${this.API_URL}/partidos`, {
      params: { username, teamId },
    });
    return res.data; // <-- mismos objetos que ya funcionan
  }

  async patchGame(id: string, changes: Partial<any>): Promise<void> {
    const ref = doc(this.firestore, `${this.gamesColPath()}/${id}`);
    await updateDoc(ref, { ...changes, updatedAt: Date.now() });
  }

  /* ---------------------------------------------------------------------- */
  /* 📤  SUBIR EXCEL + GUARDAR PARTIDO                                      */
  /* ---------------------------------------------------------------------- */

  async subirArchivo(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${this.API_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    /*  ⬇️  devolvemos el JSON con movimientos, rival, etc.  */
    return response.data;
  }
}
