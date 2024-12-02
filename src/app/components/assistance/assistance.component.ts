import { Component } from '@angular/core';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-assistance',
  templateUrl: './assistance.component.html',
  styleUrls: ['./assistance.component.css']
})
export class AssistanceComponent {
  players: Player[] = []; //Lista de jugadores con objetos Player
  currentMonth: number = new Date().getMonth(); //Variable numérica que guarda el número del mes actual
  currentYear: number = new Date().getFullYear(); //Variable numérica que guarda el número del año actual
  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  trainingDays: { date: Date }[] = []; //Lista que almacena los días de entrenamiento

  //Constructor que crea un objeto del PlayerService
  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.generateTrainingDays();
    this.players = this.playerService.getPlayers();

    const storedTrainings = this.playerService.getTrainingDays();

    this.trainingDays = this.trainingDays.map(day => {
      return day;
    });
  }

  //Método para obtener el mes actual al cambiar de mes
  get currentMonthName(): string {
    return this.months[this.currentMonth];
  }

  //Método para obtener el día de la semana dependiendo del número de la variables dayOfWeek
  getDayName(day: Date): string {
    const dayOfWeek = day.getDay();
    const days = {
      2: 'Martes',
      4: 'Jueves',
      5: 'Viernes',
    } as const;

    return days[dayOfWeek as 2 | 4 | 5] || '';
  }

  //Método para ordenar a los jugadores según sus posiciones
  get playersSorted() {
    return this.playerService.getPlayers().sort((a, b) => this.comparePositions(a.position, b.position));
  }

  //Método para comparar y ordenar a los jugadores según su posición
  comparePositions(posA: string, posB: string): number {
    const order = ['Base', 'Escolta', 'Alero', 'Ala pivot', 'Pivot', 'Cadete'];
    return order.indexOf(posA) - order.indexOf(posB);
  }

  generateTrainingDays() {
    this.trainingDays = [];
    let currentMonth = this.currentMonth;
    let currentYear = this.currentYear;
    let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const excludedDates = [
      new Date(2024, 10, 1), // 1 de noviembre
      new Date(2024, 10, 8), // 8 de noviembre
      new Date(2024, 10, 15), // 15 de noviembre
      new Date(2024, 10, 22) // 22 de noviembre
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
  }

  //Método para obtener la cuenta de cuantos jugadores han acudido a cada entrenamiento
  getAttendanceCount(date: string): number {
    return this.players.filter(player => player.attendance[date]).length;
  }

  //Método para alternar la asistencia de un jugador a un entrenamiento
  toggleAttendance(playerId: number, date: Date, event: Event) {
    const target = event.target as HTMLInputElement;
    const attended = target.checked;
    const formattedDate = this.formatDate(date);
    this.playerService.updatePlayerAttendance(playerId, formattedDate, attended);
  }

  //Método para formatear la fecha y mostrarla como dia/mes/año
  formatDate(date: Date): string {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  //Método para cambiar al mes anterior
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

    //Generamos los días de entrenamientos del mes seleccionado
    this.generateTrainingDays();
  }

  //Método para cambiar al siguiente mes
  nextMonth() {
    if (this.currentMonth < 11) {
      this.currentMonth++;
    } else {
      this.currentMonth = 0;
      this.currentYear++;
    }

    //Generamos los días de entrenamientos del mes seleccionado
    this.generateTrainingDays();
  }
}
