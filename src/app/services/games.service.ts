import { Injectable } from "@angular/core";
import { Game } from "../models/game.model";

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  private localStorageGamesKey = 'games';
  private games: Game[] = [];

  constructor() {
    this.loadGamesFromLocalStorage();
  }

  getGames(): Game[] {
    return this.games;
  }

  addGame(game: Game){
    this.games.push(game);
    this.saveToLocalStorage();
  }

  removeGame(gameId: number) {
    this.games = this.games.filter(game => game.id !== gameId);
    this.saveToLocalStorage();
  }

  private saveToLocalStorage() {
    localStorage.setItem(this.localStorageGamesKey, JSON.stringify(this.games));
  }

  private loadGamesFromLocalStorage() {
    const gamesData = localStorage.getItem(this.localStorageGamesKey);
    if (gamesData) {
      this.games = JSON.parse(gamesData);
    }
  }
}
