import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private localStorageKey = 'players'; // Clave para LocalStorage de jugadores
  private localStorageTrainingKey = 'trainings'; // Clave para almacenar los entrenamientos
  private players: Player[] = [];
  private trainingDays: { date: string, cancelled: boolean }[] = [];

  constructor() {
    this.loadFromLocalStorage(); // Cargar jugadores al iniciar el servicio
    this.loadTrainingDaysFromLocalStorage(); // Cargar entrenamientos desde el LocalStorage
  }

  // Obtener la lista de jugadores
  getPlayers(): Player[] {
    return this.players;
  }

  // Obtener la lista de entrenamientos (cancelados o no)
  getTrainingDays(): { date: string, cancelled: boolean }[] {
    return this.trainingDays;
  }

  // Agregar un jugador
  addPlayer(player: Player) {
    this.players.push(player);
    this.saveToLocalStorage(); // Guardar jugadores en LocalStorage
  }

  // Eliminar un jugador
  removePlayer(playerId: number) {
    this.players = this.players.filter(player => player.id !== playerId); // Eliminar solo el jugador con este id
    this.saveToLocalStorage(); // Guardar en LocalStorage
  }

  // Actualizar asistencia de un jugador
  updatePlayerAttendance(playerId: number, date: string, attended: boolean) {
    const player = this.players.find(p => p.id === playerId); // Buscar el jugador por ID
    if (player) {
      player.attendance[date] = attended; // Guardar el estado de la asistencia
      this.saveToLocalStorage(); // Guardar los cambios en LocalStorage
    }
  }

  // Marcar o desmarcar un entrenamiento como cancelado
  updateTrainingStatus(date: string, isCancelled: boolean) {
    const existingDay = this.trainingDays.find(day => day.date === date);
    if (existingDay) {
      existingDay.cancelled = isCancelled; // Actualizar el estado de cancelación
    } else {
      this.trainingDays.push({ date, cancelled: isCancelled }); // Agregar nuevo día si no existe
    }
    this.saveTrainingDaysToLocalStorage(); // Guardar los entrenamientos en LocalStorage
  }

  // Cargar jugadores desde LocalStorage
  private loadFromLocalStorage() {
    const playersData = localStorage.getItem(this.localStorageKey);
    if (playersData) {
      this.players = JSON.parse(playersData);
    }
  }

  // Guardar jugadores en LocalStorage
  private saveToLocalStorage() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.players));
  }

  // Cargar entrenamientos desde LocalStorage
  private loadTrainingDaysFromLocalStorage() {
    const trainingData = localStorage.getItem(this.localStorageTrainingKey);
    if (trainingData) {
      this.trainingDays = JSON.parse(trainingData);
    } else {
      this.trainingDays = []; // Inicializar como vacío si no existe en LocalStorage
    }
  }

  // Guardar entrenamientos en LocalStorage
  private saveTrainingDaysToLocalStorage() {
    localStorage.setItem(this.localStorageTrainingKey, JSON.stringify(this.trainingDays));
  }
}
