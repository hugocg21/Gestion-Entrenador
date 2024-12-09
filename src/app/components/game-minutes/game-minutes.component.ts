import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';
import { GamesService } from '../../services/games.service';
import { Game } from '../../models/game.model';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);
Chart.register(...registerables);

@Component({
  selector: 'app-game-minutes',
  templateUrl: './game-minutes.component.html',
})
export class GameMinutesComponent implements OnInit {
  players: Player[] = []; // Lista completa de jugadores
  teams: string[] = []; // Lista de los nombres de los oponentes (labels)
  games: Game[] = [];
  currentPlayerIndex: number = 0; // Índice del jugador actual
  currentChart: any = null; // Instancia del gráfico actual

  constructor(private playerService: PlayerService, private gamesService: GamesService) {}

  ngOnInit(): void {
    this.loadPlayers();
    this.loadGames();
    this.loadTeams(); // Cargar partidos desde el servicio
  }

  loadPlayers(): void {
    this.playerService.getPlayers().subscribe((players) => {
      // Verificar que los datos de minutos jugados están siendo recuperados correctamente
      console.log('Jugadores cargados:', players);

      this.players = players;

      // Revisamos si el objeto 'gameMinutes' contiene los datos correctos para cada jugador
      this.players.forEach(player => {
        console.log(`Minutos jugados para ${player.firstName}:`, player.gameMinutes);
      });

      this.renderChart();  // Renderizar la gráfica cuando los jugadores se han cargado
    });
  }

  loadGames(): void {
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

  loadTeams(): void {
    this.gamesService.getGames().subscribe((games) => {
      this.teams = games.map((game) => game.opponent); // Extraer los nombres de los oponentes
      this.renderChart(); // Renderizar la gráfica una vez que los partidos estén cargados
    });
  }

  renderChart(): void {
    const player = this.players[this.currentPlayerIndex];
    const labels = this.teams; // Las etiquetas deben ser los oponentes (equipos)

    // Verificamos la estructura del objeto 'gameMinutes'
    console.log('Estructura de gameMinutes del jugador:', player.gameMinutes);

    const gameIds = this.games.map((game) => game.id); // Obtener los gameIds de los partidos

    console.log(gameIds)

    const data = gameIds.map((gameId) => {
      // Verificamos si 'gameMinutes' contiene el 'gameId'
      console.log(`Buscando minutos para el partido con ID: ${gameId}`);
      const gameMinutes = player.gameMinutes && player.gameMinutes[gameId] !== undefined ? player.gameMinutes[gameId] : 0;  // Asignar 0 si no hay datos de minutos

      // Imprimimos los minutos para cada equipo
      console.log(`Minutos jugados contra ${gameId}: ${gameMinutes}`);

      return gameMinutes;
    });

    // Verificamos los datos de minutos que se están pasando al gráfico
    console.log('Datos de minutos para el gráfico:', data);

    const chartData = {
      label: `Jugador: ${player.firstName}`,  // Nombre del jugador
      data,  // Minutos jugados contra cada oponente
      backgroundColor: `white`,
      borderColor: `white`,
      borderWidth: 1,
    };

    const canvasId = `gameMinutesChart`;

    // Si existe un gráfico previo, lo destruimos antes de crear uno nuevo
    if (this.currentChart) {
      this.currentChart.destroy();
    }

    // Crear el canvas dinámicamente
    const canvasElement = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvasElement) {
      const newCanvas = document.createElement('canvas');
      newCanvas.id = canvasId;
      document.getElementById('chartContainer')?.appendChild(newCanvas);
    }

    const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d');
    if (ctx) {
      this.currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,  // Las etiquetas son los oponentes (equipos)
          datasets: [chartData],  // Los datos de cada jugador
        },
        options: {
          responsive: true,
          plugins: {
            datalabels: {
              color: 'white', // Color de las etiquetas
              anchor: 'end', // Posición de la etiqueta (puede ser 'start', 'center', 'end')
              align: 'top',  // Alineación respecto a la barra ('top', 'bottom', etc.)
              formatter: (value) => `${value} min`, // Formato del texto mostrado
              font: {
                weight: 'bold', // Peso de la fuente
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              min: 0, // Valor mínimo fijo
              max: 40, // Valor máximo fijo
              title: {
                display: true,
              },
            },
            x: {
              title: {
                display: true,
              },
              ticks: {
                autoSkip: false,  // Aseguramos que todos los nombres se muestren
                maxRotation: 45,  // Rotamos un poco las etiquetas si es necesario
                minRotation: 45,  // Para evitar que se superpongan
              },
            },
          },
        },
        plugins: [ChartDataLabels], // Registramos el complemento para este gráfico
      });
    }

  }


  // Función para cambiar al siguiente jugador
  nextPlayer(): void {
    if (this.currentPlayerIndex < this.players.length - 1) {
      this.currentPlayerIndex++;
      this.renderChart(); // Renderizar la gráfica del siguiente jugador
    }
  }

  // Función para cambiar al jugador anterior
  prevPlayer(): void {
    if (this.currentPlayerIndex > 0) {
      this.currentPlayerIndex--;
      this.renderChart(); // Renderizar la gráfica del jugador anterior
    }
  }
}
