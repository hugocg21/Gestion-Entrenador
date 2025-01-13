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
  players: Player[] = [];
  teams: string[] = [];
  games: Game[] = [];
  currentPlayerIndex: number = 0;
  charts: Chart[] = [];
  averageMinutes: number = 0;

  constructor(
    private playerService: PlayerService,
    private gamesService: GamesService
  ) {}

  ngOnInit(): void {
    this.loadPlayers();
    this.loadGames();
    this.loadTeams();
  }

  loadPlayers(): void {
    this.playerService.getPlayers().subscribe((players) => {
      this.players = players;
      this.renderCharts();
    });
  }

  loadGames(): void {
    this.gamesService.getGames().subscribe((games) => {
      this.games = games;
    });
  }

  loadTeams(): void {
    this.gamesService.getGames().subscribe((games) => {
      this.teams = games.map((game) => game.opponent);
      this.renderCharts();
    });
  }

  renderCharts(): void {
    // Limpiar gráficos anteriores
    this.charts.forEach((chart) => chart.destroy());
    this.charts = [];

    const player = this.players[this.currentPlayerIndex];
    const gameIds = this.games.map((game) => game.id);

    // Obtener estadísticas por juego
    const minutesPlayed = gameIds.map((gameId) =>
      player.gameMinutes && player.gameMinutes[gameId]?.minutes !== undefined
        ? player.gameMinutes[gameId].minutes
        : 0
    );

    const points = gameIds.map((gameId) =>
      player.gameMinutes && player.gameMinutes[gameId]?.points !== undefined
        ? player.gameMinutes[gameId].points
        : 0
    );

    const fouls = gameIds.map((gameId) =>
      player.gameMinutes && player.gameMinutes[gameId]?.fouls !== undefined
        ? player.gameMinutes[gameId].fouls
        : 0
    );

    const efficiency = gameIds.map((gameId) =>
      player.gameMinutes && player.gameMinutes[gameId]?.efficiency !== undefined
        ? player.gameMinutes[gameId].efficiency
        : 0
    );

    // Calcular la media de minutos excluyendo valores cero
    const validMinutes = minutesPlayed.filter((minutes) => minutes > 0);
    this.averageMinutes =
      validMinutes.length > 0
        ? validMinutes.reduce((sum, minutes) => sum + minutes, 0) /
          validMinutes.length
        : 0;

    const chartConfigs = [
      { id: 'chart1', label: 'Minutos Jugados', data: minutesPlayed },
      { id: 'chart2', label: 'Puntos Anotados', data: points },
      { id: 'chart3', label: 'Valoración', data: efficiency },
      { id: 'chart4', label: 'Faltas Cometidas', data: fouls },
    ];

    chartConfigs.forEach((config) => {
      const canvasId = config.id;
      const canvasElement = document.getElementById(canvasId) as HTMLCanvasElement;
      const ctx = canvasElement?.getContext('2d');
      if (ctx) {
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
                datalabels: {
                  color: 'gray',
                  anchor: 'end',
                  align: 'top',
                  formatter: (value) => `${value}`,
                  font: {
                    weight: 'bold',
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Cantidad',
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: 'Equipos',
                  },
                },
              },
            },
          })
        );
      }
    });
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
}

