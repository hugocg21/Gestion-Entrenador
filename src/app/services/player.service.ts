import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private localStorageKey = 'players';
  private localStorageTrainingKey = 'trainings';
  private players: Player[] = [];
  private trainingDays: { date: string }[] = [];

  constructor() {
    this.loadFromLocalStorage();
    this.loadTrainingDaysFromLocalStorage();
  }

  getPlayers(): Player[] {
    return this.players;
  }

  getTrainingDays(): { date: string }[] {
    return this.trainingDays;
  }

  addPlayer(player: Player) {
    this.players.push(player);
    this.saveToLocalStorage();
  }

  removePlayer(playerId: number) {
    this.players = this.players.filter(player => player.id !== playerId);
    this.saveToLocalStorage();
  }

  updatePlayer(updatedPlayer: Player) {
    const index = this.players.findIndex(player => player.id === updatedPlayer.id);
    if (index !== -1) {
      this.players[index] = updatedPlayer;
      this.saveToLocalStorage();
    }
  }

  updatePlayerAttendance(playerId: number, date: string, attended: boolean) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.attendance[date] = attended;
      this.saveToLocalStorage();
    }
  }

  updateTrainingStatus(date: string) {
    this.trainingDays.push({ date });
    this.saveTrainingDaysToLocalStorage();
  }

  private loadFromLocalStorage() {
    const playersData = localStorage.getItem(this.localStorageKey);
    if (playersData) {
      this.players = JSON.parse(playersData);
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.players));
  }

  private loadTrainingDaysFromLocalStorage() {
    const trainingData = localStorage.getItem(this.localStorageTrainingKey);
    if (trainingData) {
      this.trainingDays = JSON.parse(trainingData);
    } else {
      this.trainingDays = [];
    }
  }

  private saveTrainingDaysToLocalStorage() {
    localStorage.setItem(this.localStorageTrainingKey, JSON.stringify(this.trainingDays));
  }
}
