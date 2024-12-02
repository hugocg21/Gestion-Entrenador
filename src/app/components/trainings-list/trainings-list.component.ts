import { Component, OnInit } from '@angular/core';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'trainings-list',
  templateUrl: './trainings-list.component.html'
})
export class TrainingsListComponent implements OnInit{
  weeks: { number: number; trainingDays: Date[] }[] = [];
  players: Player[] = [];
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  currentMonthName = this.getMonthName(this.currentMonth);
  today: Date = new Date();

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.players = this.playerService.getPlayers();
    this.generateWeeks();
  }

  generateWeeks() {
    const daysInMonth = this.getTrainingDaysForMonth();
    let currentWeek: Date[] = [];
    let weekNumber = 1;

    this.weeks = [];

    daysInMonth.forEach((day) => {
      currentWeek.push(day);

      // Agrupar por semanas (3 entrenamientos por semana)
      if (currentWeek.length === 3) {
        this.weeks.push({ number: weekNumber, trainingDays: currentWeek });
        currentWeek = [];
        weekNumber++;
      }
    });

    // Si al final del mes no hay 3 días, empujar la última semana con los días restantes
    if (currentWeek.length > 0) {
      this.weeks.push({ number: weekNumber, trainingDays: currentWeek });
    }
  }

  getTrainingDaysForMonth() {
    const trainingDays = [];
    const currentDate = new Date(this.currentYear, this.currentMonth, 1);

    // Iterar por todos los días del mes actual
    while (currentDate.getMonth() === this.currentMonth) {
      if ([2, 4, 5].includes(currentDate.getDay())) {
        trainingDays.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return trainingDays;
  }

  getTrainingInfo(day: Date) {
    const dayOfWeek = day.getDay();
    let location = '';
    let time = '18:30 - 20:00';

    if (dayOfWeek === 2 || dayOfWeek === 5) {
      // Martes y Viernes
      location = 'IES N1';
    } else if (dayOfWeek === 4) {
      // Jueves
      location = 'Perchera La Braña';
    }

    return { location, time };
  }

  // Obtener el conteo de asistencia desde el servicio
  getAttendanceCount(date: string): number {
    return this.players.filter(player => player.attendance[date]).length;
  }

  isPast(day: Date): boolean {
    return day < this.today;
  }

  isToday(day: Date): boolean {
    return day.toDateString() === this.today.toDateString();
  }

  isFuture(day: Date): boolean {
    return day > this.today;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Formato: YYYY-MM-DD
  }

  getDayName(date: Date): string {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return daysOfWeek[date.getDay()];
  }

  previousMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.currentMonthName = this.getMonthName(this.currentMonth);
    this.generateWeeks();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.currentMonthName = this.getMonthName(this.currentMonth);
    this.generateWeeks();
  }

  getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month];
  }
}
