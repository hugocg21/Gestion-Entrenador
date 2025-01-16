import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';
import { GamesService } from '../../services/games.service';
import { Game } from '../../models/game.model';
import { Observable } from 'rxjs'; // Necesario para Observable
import { ThemeService } from '../../services/theme.service';

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

  // Declarar gameStats
  gameStats: {
    [playerId: number]: {
      minutes: number;
      points: number;
      fouls: number;
      freeThrows: { made: number; attempted: number };
      efficiency: number;
    };
  } = {};

  //Constructor que crea un objeto del PlayerService
  constructor(private playerService: PlayerService, private gamesService: GamesService, private themeService: ThemeService) {}

  ngOnInit(): void {
    this.playerService.getPlayers().subscribe(
      (players: Player[]) => {
        this.players = players; // Asignamos los jugadores cuando se reciben

        // Inicializar gameStats para cada jugador
        this.players.forEach((player) => {
          this.gameStats[player.id] = {
            minutes: 0,
            points: 0,
            fouls: 0,
            freeThrows: { made: 0, attempted: 0 },
            efficiency: 0,
          };
        });
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

    // Escuchar los cambios en el modo oscuro
    this.themeService.isDarkMode$.subscribe((isDarkMode) => {
      this.isDarkMode = isDarkMode;
    });
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
    };

    this.gamesService.addGame(game)
      .then(() => console.log('Partido agregado correctamente'))
      .catch((error) => console.error('Error al agregar el partido:', error));

    this.newGame = {}; // Reinicia el formulario
    this.closeModal();
  }

  removeGame(gameId: number) {
    // Convertimos el gameId a string antes de pasarlo al servicio
    this.gamesService.removeGame(gameId.toString())
      .then(() => {
        // Filtramos la lista local de partidos
        this.games = this.games.filter(game => game.id !== gameId);
      })
      .catch(error => console.error('Error al eliminar el partido:', error));
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
      this.isVisitor = true;
    } else {
      this.isVisitor = false;
    }
  }

  // Método para abrir el modal y pasar el partido seleccionado
  openGameMinutesModal(game: Game): void {
    this.selectedGame = game;

    // Inicializar estadísticas para cada jugador
    this.players.forEach((player) => {
      this.playerService.getPlayerById(player.id.toString()).subscribe((playerData) => {
        // Validar si `gameMinutes` y las propiedades existen
        if (playerData && playerData.gameMinutes && playerData.gameMinutes[game.opponent]) {
          this.gameStats[player.id] = { ...playerData.gameMinutes[game.opponent] };
        } else {
          // Asignar valores por defecto si no existen
          this.gameStats[player.id] = {
            minutes: 0,
            points: 0,
            fouls: 0,
            freeThrows: { made: 0, attempted: 0 },
            efficiency: 0,
          };
        }
      });
    });

    this.showGameMinutesModal = true;
  }

  // Método para cerrar el modal de asignación de minutos
  closeGameMinutesModal() {
    this.showGameMinutesModal = false;
  }

  // Método para actualizar los minutos jugados de cada jugador
  updateGameMinutes(): void {
    if (this.selectedGame) {
      this.players.forEach((player) => {
        const stats = this.gameStats[player.id];
        if (stats) {
          this.playerService.updatePlayerGameMinutes(player.id.toString(), this.selectedGame.opponent!, stats).then(() => {
            console.log(`Estadísticas del jugador ${player.firstName} actualizadas correctamente.`);
          }).catch((error) => console.error('Error al actualizar estadísticas del jugador:', error));
        }
      });

      this.closeGameMinutesModal();
    }
  }

  isWin(game: Game): boolean {
    if(game.opponent == 'CB PUMARIN 2') return false

    if(game.location == 'PAB. PERCHERA-LA BRAÑA'){
      if(game.ownPoints > game.opponentPoints) return false
      else return true
    } else {
      if(game.ownPoints > game.opponentPoints) return true
      else return false
    }
  }

  get firstPhaseGames(): Game[] {
    const cutoffDate = new Date(2025, 0, 11); // 11/01/2025
    return this.games
      .filter(game => new Date(game.date) < cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  get secondPhaseGames(): Game[] {
    const cutoffDate = new Date(2025, 0, 11); // 11/01/2025
    return this.games
      .filter(game => new Date(game.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  getFreeThrowsMade(playerId: number): number {
    return this.gameStats[playerId]?.freeThrows.made || 0;
  }

  setFreeThrowsMade(playerId: number, value: number): void {
    if (!this.gameStats[playerId]) {
      this.initializePlayerStats(playerId);
    }
    this.gameStats[playerId].freeThrows.made = value;
  }

  initializePlayerStats(playerId: number): void {
    this.gameStats[playerId] = {
      minutes: 0,
      points: 0,
      fouls: 0,
      freeThrows: { made: 0, attempted: 0 },
      efficiency: 0,
    };
  }

  get playersSortedByDorsal(): Player[] {
    return this.players.sort((a, b) => a.dorsal - b.dorsal);
  }

  isDarkMode: boolean = false;

  toggleDarkMode() {
    this.themeService.toggleDarkMode(); // Cambiar el tema
  }
}
