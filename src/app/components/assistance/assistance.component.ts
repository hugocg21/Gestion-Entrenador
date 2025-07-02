import { Component, OnInit } from '@angular/core';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assistance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assistance.component.html',
  styleUrls: ['./assistance.component.css'],
})
export class AssistanceComponent implements OnInit {
  players: Player[] = []; // Lista de jugadores con objetos Player
  currentMonth: number = 5; // Junio (los meses van de 0 a 11)
  currentYear: number = 2025;

  months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  trainingDays: { date: Date }[] = []; // Lista que almacena los días de entrenamiento

  constructor(
    private playerService: PlayerService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Obtener jugadores de forma asincrónica
    this.playerService.getPlayers().subscribe((players: Player[]) => {
      this.players = players;
    });

    // Generamos los días de entrenamiento del mes actual
    this.generateTrainingDays();

    // Escuchar los cambios en el modo oscuro
    this.themeService.isDarkMode$.subscribe((isDarkMode) => {
      this.isDarkMode = isDarkMode;
    });
  }

  // Obtener el nombre del mes actual
  get currentMonthName(): string {
    return this.months[this.currentMonth];
  }

  // Obtener el nombre del día de la semana de un entrenamiento
  getDayName(day: Date): string {
    const dayOfWeek = day.getDay();
    const days = {
      2: 'Martes',
      3: 'Miercoles',
      4: 'Jueves',
      5: 'Viernes',
    } as const;

    return days[dayOfWeek as 2 | 3 | 4 | 5] || '';
  }

  // Ordenar jugadores por posición
  get playersSorted() {
    return this.players.sort((a, b) =>
      this.comparePositions(a.position, b.position)
    );
  }

  // Comparar posiciones para ordenar a los jugadores
  comparePositions(posA: string, posB: string): number {
    const order = ['Base', 'Exterior', 'Interior'];
    return order.indexOf(posA) - order.indexOf(posB);
  }

  generateTrainingDays() {
    this.trainingDays = [];
    const currentMonth = this.currentMonth;
    const currentYear = this.currentYear;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const cutoffDate = new Date(2025, 5, 13); // 13 de junio de 2025

    const excludedDates = [
      new Date(2024, 10, 1),
      new Date(2024, 10, 8),
      new Date(2024, 10, 15),
      new Date(2024, 10, 22),
      new Date(2024, 11, 6),
      new Date(2024, 11, 13),
      new Date(2024, 11, 24),
      new Date(2024, 11, 26),
      new Date(2024, 11, 27),
      new Date(2024, 11, 31),
      new Date(2025, 0, 2),
      new Date(2025, 0, 3),
      new Date(2025, 0, 17),
      new Date(2025, 1, 14),
      new Date(2025, 1, 21),
      new Date(2025, 1, 28),
      new Date(2025, 2, 4),
      new Date(2025, 2, 28),
      new Date(2025, 3, 1),
      new Date(2025, 3, 4),
      new Date(2025, 3, 11),
      new Date(2025, 3, 15),
      new Date(2025, 3, 17),
      new Date(2025, 3, 18),
      new Date(2025, 3, 25),
      new Date(2025, 4, 1),
      new Date(2025, 4, 9),
      new Date(2025, 4, 16),
      new Date(2025, 4, 23),
      new Date(2025, 5, 3),
    ];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();

      // Detener generación si se pasa del 13 de junio de 2025
      if (date > cutoffDate) continue;

      const isExcluded = excludedDates.some(
        (d) => d.getTime() === date.getTime()
      );

      const isTrainingDay =
        (currentYear === 2024 &&
          currentMonth === 8 &&
          (dayOfWeek === 2 || dayOfWeek === 4)) || // septiembre
        ((currentYear > 2024 || (currentYear === 2024 && currentMonth >= 9)) &&
          [2, 4, 5].includes(dayOfWeek)); // octubre 2024 en adelante

      if (isTrainingDay && !isExcluded) {
        this.trainingDays.push({ date: new Date(date) });
      }
    }

    // Día de entrenamiento específico: 8 de enero de 2025
    const specificDate = new Date(2025, 0, 8);
    if (
      specificDate <= cutoffDate &&
      specificDate.getFullYear() === currentYear &&
      specificDate.getMonth() === currentMonth
    ) {
      this.trainingDays.push({ date: specificDate });
    }

    this.trainingDays.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Obtener la cuenta de jugadores presentes en un entrenamiento
  getAttendanceCount(date: string): number {
    return this.players.filter((player) => player.attendance[date]).length;
  }

  // Alternar la asistencia de un jugador
  toggleAttendance(playerId: string, date: Date, event: Event) {
    const target = event.target as HTMLInputElement;
    const attended = target.checked;
    const formattedDate = this.formatDate(date);

    // Convertir playerId a string antes de usarlo en el servicio
    this.playerService
      .updatePlayerAttendance(playerId.toString(), formattedDate, attended)
      .then(() => {
        console.log(
          `Asistencia actualizada: Jugador ${playerId}, Fecha ${formattedDate}, Asistió: ${attended}`
        );
      })
      .catch((error) => {
        console.error('Error al actualizar la asistencia:', error);
        // Si hay un error, revertir el cambio visual
        target.checked = !attended;
      });
  }

  // Formatear fecha en formato 'día/mes/año'
  formatDate(date: Date): string {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
  }

  // Cambiar al mes anterior
  previousMonth() {
    if (this.currentYear === 2024 && this.currentMonth === 8) {
      return;
    }
    if (this.currentMonth > 0) {
      this.currentMonth--;
    } else {
      this.currentMonth = 11;
      this.currentYear--;
    }

    // Generar los días de entrenamientos del mes seleccionado
    this.generateTrainingDays();
  }

  nextMonth() {
    // Si ya estamos en junio de 2025, no permitir avanzar más
    if (this.currentYear === 2025 && this.currentMonth === 5) {
      return;
    }

    if (this.currentMonth < 11) {
      this.currentMonth++;
    } else {
      this.currentMonth = 0;
      this.currentYear++;
    }

    this.generateTrainingDays();
  }

  isDarkMode: boolean = false;

  toggleDarkMode() {
    this.themeService.toggleDarkMode(); // Cambiar el tema
  }
}
