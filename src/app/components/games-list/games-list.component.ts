import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';
import { GamesService } from '../../services/games.service';
import { Game } from '../../models/game.model';
import { Observable } from 'rxjs'; // Necesario para Observable

@Component({
  selector: 'games-list',
  templateUrl: './games-list.component.html',
})
export class GamesListComponent implements OnInit {
  scoreInput: string = ''; // Maneja el valor del input combinado
  isVisitor: boolean = false; // Determina si es visitante
  players: Player[] = []; // Lista de jugadores
  games: Game[] = [];
  game: Partial<Game> = {
    date: '',
    time: '',
    location: '',
    opponent: '',
    ownPoints: 0,
    opponentPoints: 0,
  }; // Objeto partido
  newGame: Partial<Game> = {};
  showModal: boolean = false; //Booleano para mostrar u ocultar el modal de creación de jugadores
  showGameMinutesModal: boolean = false; // Booleano para mostrar u ocultar el modal de asignar minutos
  selectedGame!: Game; // Partido seleccionado
  gameMinutes: { [playerId: string]: number } = {}; // Minutos jugados por cada jugador

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

    this.gamesService.getGames().subscribe(
      (games: Game[]) => {
        this.games = games;
        console.log('Partidos cargados:', this.games); // Confirmar que los datos llegan correctamente
      },
      (error) => {
        console.error('Error al cargar los partidos:', error);
      }
    );
  }

  // Método para ordenar los partidos por fecha
  get gamesSorted() {
    this.sortGames(); // Ordena los jugadores según la categoría y dirección
    return this.games;
  }

  // Método para comparar las fechas de los partidos
  compareDates(dateA: string, dateB: string): number {
    const timestampA = new Date(dateA).getTime();
    const timestampB = new Date(dateB).getTime();
    return timestampA - timestampB; // Orden ascendente por fecha
  }

  addGame() {
    if (!this.newGame.date || !this.newGame.time || !this.newGame.location || !this.newGame.opponent || !this.newGame.ownPoints || !this.newGame.opponentPoints) {
      console.error('Todos los campos del partido son obligatorios.');
      return;
    }

    const newId = Date.now();
    const game: Game = {
      id: newId,
      date: this.newGame.date,
      time: this.newGame.time,
      location: this.newGame.location,
      opponent: this.newGame.opponent,
      opponentPoints: this.newGame.opponentPoints,
      ownPoints: this.newGame.ownPoints,
      playerMinutes: {},
    };

    this.gamesService.addGame(game).then(() => console.log('Partido agregado correctamente')).catch((error) => console.error('Error al agregar el partido:', error));

    this.newGame = {}; // Reinicia el formulario
    this.closeModal();
  }

  removeGame(gameId: number) {
    this.gamesService.removeGame(gameId);
    this.games = this.games.filter(game => game.id !== gameId);
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
  }

  // Métodos para abrir el modal de creación de jugadores
  openModal() {
    this.showModal = true;
  }

  // Método para cerrar el modal de creación de jugadores
  closeModal() {
    this.showModal = false;
  }

  // Método para ordenar los jugadores según la categoría y dirección
  sortGames() {
    this.games.sort((a, b) => { return this.compareDates(a.date, b.date); });
  }

  updateScores(value: string): void {
    const [local, visitor] = value.split('-').map((num) => parseInt(num.trim(), 10));

    if (!isNaN(local) && !isNaN(visitor)) {
      if (this.isVisitor) {
        this.newGame.ownPoints = local;
        this.newGame.opponentPoints = visitor;
      } else {
        this.newGame.ownPoints = visitor;
        this.newGame.opponentPoints = local;
      }

      console.log('isVisitor:', this.isVisitor);
      console.log(
        'ownPoints:',
        this.newGame.ownPoints,
        'opponentPoints:',
        this.newGame.opponentPoints
      );
    }
  }

  // Método para determinar si es visitante o local
  updateLocation(location: string): void {
    this.newGame.location = location.trim();
    if (this.newGame.location.toUpperCase() !== 'PAB. PERCHERA-LA BRAÑA') {
      this.isVisitor = true; // Aquí usamos '=' para asignar
    } else {
      this.isVisitor = false; // Aquí también
    }
  }

  // Método para abrir el modal y pasar el partido seleccionado
  openGameMinutesModal(game: Game) {
    this.selectedGame = game;
    this.gameMinutes = { ...game.playerMinutes }; // Inicializar los minutos ya asignados, si los hay
    this.showGameMinutesModal = true;
  }

  // Método para cerrar el modal de asignación de minutos
  closeGameMinutesModal() {
    this.showGameMinutesModal = false;
  }

  // Método para actualizar los minutos jugados de cada jugador
  updateGameMinutes() {
    if (this.selectedGame) {
      // Actualizar los minutos en el partido seleccionado
      this.selectedGame.playerMinutes = this.gameMinutes;

      // Llamar al servicio para actualizar el partido en la base de datos
      this.gamesService.updateGame(this.selectedGame.id, this.selectedGame).then(() => {
        console.log('Minutos actualizados correctamente');

        // Para cada jugador, actualizar los minutos jugados en ese partido en su documento
        for (const playerId in this.gameMinutes) {
          const minutes = this.gameMinutes[playerId];

          // Llamamos al servicio de Player para guardar los minutos del jugador
          this.playerService.updatePlayerGameMinutes(Number(playerId).toString(), this.selectedGame.id.toString(), minutes).then(() => {
              console.log(`Minutos de jugador ${playerId} actualizados correctamente.`);
            }).catch((error) => {
              console.error(`Error al actualizar los minutos para el jugador ${playerId}:`, error);
            });
        }

        this.closeGameMinutesModal();
      }).catch((error) => {
        console.error('Error al actualizar los minutos en el partido:', error);
      });
    }
  }
}
