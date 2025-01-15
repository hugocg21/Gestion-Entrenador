import { Component, OnInit } from '@angular/core';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-assistance',
  templateUrl: './assistance.component.html',
  styleUrls: ['./assistance.component.css']
})
export class AssistanceComponent implements OnInit {
  players: Player[] = []; // Lista de jugadores con objetos Player
  currentMonth: number = new Date().getMonth(); // Variable numérica que guarda el número del mes actual
  currentYear: number = new Date().getFullYear(); // Variable numérica que guarda el número del año actual
  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  trainingDays: { date: Date }[] = []; // Lista que almacena los días de entrenamiento

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    // Obtener jugadores de forma asincrónica
    this.playerService.getPlayers().subscribe((players: Player[]) => {
      this.players = players;
    });

    // Generamos los días de entrenamiento del mes actual
    this.generateTrainingDays();
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
    return this.players.sort((a, b) => this.comparePositions(a.position, b.position));
  }

  // Comparar posiciones para ordenar a los jugadores
  comparePositions(posA: string, posB: string): number {
    const order = ['Base', 'Exterior', 'Interior'];
    return order.indexOf(posA) - order.indexOf(posB);
  }

  // Generar los días de entrenamiento del mes
  generateTrainingDays() {
    this.trainingDays = [];
    let currentMonth = this.currentMonth;
    let currentYear = this.currentYear;
    let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const excludedDates = [
      new Date(2024, 10, 1), // 1 de noviembre
      new Date(2024, 10, 8), // 8 de noviembre
      new Date(2024, 10, 15), // 15 de noviembre
      new Date(2024, 10, 22), // 22 de noviembre
      new Date(2024, 11, 6), // 6 de diciembre
      new Date(2024, 11, 13), // 13 de diciembre
      new Date(2024, 11, 24), // 24 de diciembre
      new Date(2024, 11, 26), // 26 de diciembre
      new Date(2024, 11, 27), // 27 de diciembre
      new Date(2024, 11, 31), // 31 de diciembre
      new Date(2025, 0, 2), // 2 de enero
      new Date(2025, 0, 3) // 3 de enero
    ];

    if (currentMonth === 8 && currentYear === 2024) {
      for (let day = 5; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();

        if ((dayOfWeek === 2 || dayOfWeek === 4) && !excludedDates.some(d => d.getTime() === date.getTime())) {
          this.trainingDays.push({ date: new Date(date) });
        }
      }
    } else if (currentYear > 2024 || (currentYear === 2024 && currentMonth >= 9)) {
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();

        if ((dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 5) && !excludedDates.some(d => d.getTime() === date.getTime())) {
          this.trainingDays.push({ date: new Date(date) });
        }
      }
    }

    // Agregar el 08/01/2025 como un día de entrenamiento específico
    const specificDate = new Date(2025, 0, 8); // 08 de enero de 2025
    if (
      specificDate.getFullYear() === currentYear &&
      specificDate.getMonth() === currentMonth
    ) {
      this.trainingDays.push({ date: specificDate });
    }

    // Ordenar los días de entrenamiento por fecha
    this.trainingDays.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Obtener la cuenta de jugadores presentes en un entrenamiento
  getAttendanceCount(date: string): number {
    return this.players.filter(player => player.attendance[date]).length;
  }

  // Alternar la asistencia de un jugador
  toggleAttendance(playerId: number, date: Date, event: Event) {
    const target = event.target as HTMLInputElement;
    const attended = target.checked;
    const formattedDate = this.formatDate(date);

    // Convertir playerId a string antes de usarlo en el servicio
    this.playerService.updatePlayerAttendance(playerId.toString(), formattedDate, attended).then(() => {
      console.log(`Asistencia actualizada: Jugador ${playerId}, Fecha ${formattedDate}, Asistió: ${attended}`);
    }).catch(error => {
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

  // Cambiar al siguiente mes
  nextMonth() {
    if (this.currentMonth < 11) {
      this.currentMonth++;
    } else {
      this.currentMonth = 0;
      this.currentYear++;
    }

    // Generar los días de entrenamientos del mes seleccionado
    this.generateTrainingDays();
  }
}
