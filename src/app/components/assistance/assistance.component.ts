import { Component } from '@angular/core';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-assistance',
  templateUrl: './assistance.component.html',
  styleUrls: ['./assistance.component.css']
})
export class AssistanceComponent {
  players: Player[] = [];
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  trainingDays: { date: Date, cancelled: boolean }[] = []; // Array de entrenamientos

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.generateTrainingDays();  // Generar los días de entrenamiento para el mes actual
    this.players = this.playerService.getPlayers();  // Obtener la lista de jugadores

    // Obtener los entrenamientos guardados en LocalStorage
    const storedTrainings = this.playerService.getTrainingDays();

    // Combinar los entrenamientos generados con los guardados (cancelaciones)
    this.trainingDays = this.trainingDays.map(day => {
      const storedDay = storedTrainings.find(stored => this.formatDate(new Date(stored.date)) === this.formatDate(day.date));
      if (storedDay) {
        // Si el día está en LocalStorage, aplicamos el estado de cancelación
        return { ...day, cancelled: storedDay.cancelled };
      }
      return day;
    });
  }

  // Obtener el nombre del mes actual basado en el valor de currentMonth
  get currentMonthName(): string {
    return this.months[this.currentMonth];
  }

  generateTrainingDays() {
    this.trainingDays = [];
    const startDate = new Date(2024, 8, 5); // 05 de septiembre de 2024
    const today = new Date(); // Fecha actual
    let currentMonth = this.currentMonth; // Mes seleccionado
    let currentYear = this.currentYear; // Año seleccionado
    let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Días en el mes seleccionado

    // Lógica para septiembre (solo martes y jueves)
    if (currentMonth === 8 && currentYear === 2024) {
      for (let day = 5; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();

        // Contar solo los martes (2) y jueves (4)
        if (dayOfWeek === 2 || dayOfWeek === 4) {
          this.trainingDays.push({ date: new Date(date), cancelled: false });
        }
      }
    } else if (currentYear > 2024 || (currentYear === 2024 && currentMonth >= 9)) {
      // A partir de octubre (martes, jueves y viernes)
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();

        // Contar martes (2), jueves (4) y viernes (5)
        if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 5) {
          this.trainingDays.push({ date: new Date(date), cancelled: false });
        }
      }
    }
  }

  // Obtener el número de jugadores que han asistido
  getAttendanceCount(date: string): number {
    return this.players.filter(player => player.attendance[date]).length;
  }

  // Cambiar el estado de asistencia
  toggleAttendance(playerId: number, date: Date, event: Event) {
    const target = event.target as HTMLInputElement;
    const attended = target.checked;
    const formattedDate = this.formatDate(date);
    this.playerService.updatePlayerAttendance(playerId, formattedDate, attended);
  }

  // Marcar un día como cancelado
  toggleCancelled(date: Date, event: Event) {
    const target = event.target as HTMLInputElement;
    const cancelled = target.checked;
    const formattedDate = this.formatDate(date);
    this.playerService.updateTrainingStatus(formattedDate, cancelled);
    this.trainingDays = this.trainingDays.map(day => {
      if (this.formatDate(day.date) === formattedDate) {
        return { ...day, cancelled };
      }
      return day;
    });
  }

  // Formatear fecha a DD/MM/YYYY
  formatDate(date: Date): string {
    if (!date) return ''; // Manejo de fechas inválidas
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Navegar al mes anterior
  previousMonth() {
    if (this.currentYear === 2024 && this.currentMonth === 8) {
      // Si estamos en septiembre de 2024, no permitimos retroceder
      return;
    }
    if (this.currentMonth > 0) {
      this.currentMonth--;
    } else {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateTrainingDays();
  }

  // Navegar al mes siguiente
  nextMonth() {
    if (this.currentMonth < 11) {
      this.currentMonth++;
    } else {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateTrainingDays();
  }
}
