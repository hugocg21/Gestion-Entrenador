import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';
import { GamesService } from '../../services/games.service';
import { Game } from '../../models/game.model';
import { Observable } from 'rxjs'; // Necesario para Observable

@Component({
  selector: 'games-list',
  templateUrl: './games-list.component.html'
})
export class GamesListComponent implements OnInit {
  players: Player[] = []; // Lista de jugadores
  games: Game[] = [];
  game: Partial<Game> = {
    date: '',
    time: '',
    location: '',
    opponent: '',
    selectedPlayers: []
  }; // Objeto partido
  newGame: Partial<Game> = {};
  showModal: boolean = false; //Booleano para mostrar u ocultar el modal de creación de jugadores

  //Constructor que crea un objeto del PlayerService
  constructor(private playerService: PlayerService, private gamesService: GamesService) {}

  ngOnInit(): void {
    // Obtenemos la lista de jugadores de manera asíncrona
    this.playerService.getPlayers().subscribe(
      (players: Player[]) => {
        this.players = players; // Asignamos los jugadores cuando se reciben
      },
      (error) => {
        console.error('Error al obtener los jugadores:', error); // Manejo de errores
      }
    );
  }

  // Método para ordenar los partidos por fecha
  // get gamesSorted() {
    // return this.gamesService.getGames().sort((a, b) => this.compareDates(a.date, b.date));
  // }

  // Método para comparar las fechas de los partidos
  compareDates(dateA: string, dateB: string): number {
    const timestampA = new Date(dateA).getTime();
    const timestampB = new Date(dateB).getTime();
    return timestampA - timestampB; // Orden ascendente por fecha
  }

  // Método para seleccionar/deseleccionar jugadores
  togglePlayerSelection(playerId: number) {
    if (this.game.selectedPlayers!.includes(playerId)) {
      this.game.selectedPlayers = this.game.selectedPlayers!.filter(id => id !== playerId);
    } else {
      this.game.selectedPlayers!.push(playerId);
    }
  }

  addGame() {
    const newId = Date.now();

    const game: Game = {
      id: newId,
      date: this.newGame.date!,
      time: this.newGame.time!,
      location: this.newGame.location!,
      opponent: this.newGame.opponent!,
      selectedPlayers: this.newGame.selectedPlayers!,
    };

    this.gamesService.addGame(game);

    this.newGame = {};
    this.closeModal();
  }

  removeGame(gameId: number) {
    this.gamesService.removeGame(gameId);
    this.games = this.games.filter(game => game.id !== gameId);
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    const newDate = this.newGame.date = `${day}/${month}/${year}`;
    return newDate;
  }

  // Métodos para abrir el modal de creación de jugadores
  openModal() {
    this.showModal = true;
  }

  // Método para cerrar el modal de creación de jugadores
  closeModal() {
    this.showModal = false;
  }
}
