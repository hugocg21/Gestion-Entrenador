import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';
import { GamesService } from '../../services/games.service';
import { Game } from '../../models/game.model';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ThemeService } from '../../services/theme.service';

Chart.register(ChartDataLabels);
Chart.register(...registerables);

@Component({
  selector: 'app-game-minutes',
  templateUrl: './game-minutes.component.html',
})
export class GameMinutesComponent implements OnInit {
  players: Player[] = [];
  teams: string[] = [];
  games: Game[] = [];
  currentPlayerIndex: number = 0;
  charts: Chart[] = [];
  averageMinutes: number = 0;

  constructor(private playerService: PlayerService, private gamesService: GamesService, private themeService: ThemeService) {}

  ngOnInit(): void {
    this.loadPlayers();
    this.loadGames();

    // Escuchar los cambios en el modo oscuro
    this.themeService.isDarkMode$.subscribe((isDarkMode) => {
      this.isDarkMode = isDarkMode;
    });
  }

  loadPlayers(): void {
    this.playerService.getPlayers().subscribe((players) => {
      // Ordenar jugadores por posición
      this.players = players.sort((a, b) => this.comparePositions(a.position, b.position));
      this.renderCharts();
    });
  }

  loadGames(): void {
    this.gamesService.getGames().subscribe((games) => {
      // Ordenar partidos por fecha
      this.games = games.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      this.teams = this.games.map((game) => game.opponent);
      this.renderCharts();
    });
  }

  comparePositions(posA: string, posB: string): number {
    const order = ['Base', 'Exterior', 'Interior'];
    return order.indexOf(posA) - order.indexOf(posB);
  }

  renderCharts(): void {
    if (this.players.length === 0 || this.games.length === 0) {
      console.error('No hay datos suficientes para renderizar las gráficas');
      return;
    }

    // Limpiar gráficos anteriores
    this.charts.forEach((chart) => chart.destroy());
    this.charts = [];

    const player = this.players[this.currentPlayerIndex];
    const gameIds = this.games.map((game) => game.id);

    // Estadísticas para todos los equipos
    const minutesPlayed = this.teams.map((team) =>
      player.gameMinutes && player.gameMinutes[team]?.minutes !== undefined
        ? player.gameMinutes[team].minutes
        : 0
    );

    const points = this.teams.map((team) =>
      player.gameMinutes && player.gameMinutes[team]?.points !== undefined
        ? player.gameMinutes[team].points
        : 0
    );

    const efficiency = this.teams.map((team) =>
      player.gameMinutes && player.gameMinutes[team]?.efficiency !== undefined
        ? player.gameMinutes[team].efficiency
        : 0
    );

    const freeThrowsMade = this.teams.map((team) =>
      player.gameMinutes && player.gameMinutes[team]?.freeThrows?.made !== undefined
        ? player.gameMinutes[team].freeThrows.made
        : 0
    );

    const freeThrowsAttempted = this.teams.map((team) =>
      player.gameMinutes && player.gameMinutes[team]?.freeThrows?.attempted !== undefined
        ? player.gameMinutes[team].freeThrows.attempted
        : 0
    );

    // Crear etiquetas personalizadas como "5/12"
    const freeThrowsLabels = freeThrowsMade.map((made, index) => {
      const attempted = freeThrowsAttempted[index];
      return `${made}/${attempted}`;
    });

    // Calcular la media de tiros libres anotados/intentados
    const totalMade = freeThrowsMade.reduce((sum, value) => sum + value, 0);
    const totalAttempted = freeThrowsAttempted.reduce((sum, value) => sum + value, 0);
    const averageFreeThrows = totalAttempted > 0 ? `${totalMade}/${totalAttempted}` : '0/0';
    const freeThrowsPercentaje = (totalMade / totalAttempted * 100).toFixed(2);

    // Calcular la media de minutos excluyendo valores cero
    const validMinutes = minutesPlayed.filter((minutes) => minutes > 0);
    const validPoints = points.filter((_, index) => minutesPlayed[index] > 0);
    const validEfficiency = efficiency.filter((_, index) => minutesPlayed[index] > 0);

    this.averageMinutes =
      validMinutes.length > 0
        ? validMinutes.reduce((sum, minutes) => sum + minutes, 0) / validMinutes.length
        : 0;

    const averagePoints =
      validPoints.length > 0
        ? validPoints.reduce((sum, point) => sum + point, 0) / validPoints.length
        : 0;

    const averageEfficiency =
      validEfficiency.length > 0
        ? validEfficiency.reduce((sum, eff) => sum + eff, 0) / validEfficiency.length
        : 0;

    const chartConfigs = [
      { id: 'chart1', label: 'Minutos Jugados', data: minutesPlayed },
      { id: 'chart2', label: 'Puntos Anotados', data: points },
      { id: 'chart3', label: 'Valoración', data: efficiency },
    ];

    chartConfigs.forEach((config) => {
      const canvasId = config.id;
      const canvasElement = document.getElementById(canvasId) as HTMLCanvasElement;
      const ctx = canvasElement?.getContext('2d');
      if (ctx) {
        const average = config.data.filter((_, index) => minutesPlayed[index] > 0).reduce((sum, value) => sum + value, 0) /
          validMinutes.length;
        this.charts.push(
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: this.teams,
              datasets: [
                {
                  label: config.label,
                  data: config.data,
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: `${config.label} - Media: ${average.toFixed(2)}`,
                  position: 'top',
                },
              }
            }
          })
        );
      }
    });

    // Configuración del gráfico de tiros libres
    const canvasIdFreeThrows = 'chart4';
    const canvasElementFreeThrows = document.getElementById(canvasIdFreeThrows) as HTMLCanvasElement;
    const ctxFreeThrows = canvasElementFreeThrows?.getContext('2d');

    if (ctxFreeThrows) {
      this.charts.push(
        new Chart(ctxFreeThrows, {
          type: 'bar',
          data: {
            labels: this.teams,
            datasets: [
              {
                label: 'Tiros Libres',
                data: freeThrowsMade,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              datalabels: {
                color: 'gray',
                anchor: 'end',
                align: 'top',
                formatter: (_, context) => freeThrowsLabels[context.dataIndex], // Mostrar "5/12"
                font: {
                  weight: 'bold',
                },
              },
              title: {
                display: true,
                text: `Tiros Libres - Totales: ${averageFreeThrows} (${freeThrowsPercentaje}%)`,
                position: 'top',
              },
            }
          }
        })
      );
    }
  }

  nextPlayer(): void {
    if (this.currentPlayerIndex < this.players.length - 1) {
      this.currentPlayerIndex++;
      this.renderCharts();
    }
  }

  prevPlayer(): void {
    if (this.currentPlayerIndex > 0) {
      this.currentPlayerIndex--;
      this.renderCharts();
    }
  }

  isDarkMode: boolean = false;

  toggleDarkMode() {
    this.themeService.toggleDarkMode(); // Cambiar el tema
  }
}
