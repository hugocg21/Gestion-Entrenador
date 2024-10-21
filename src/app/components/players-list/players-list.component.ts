import { Component, OnInit } from '@angular/core';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrl: './players-list.component.css'
})
export class PlayersListComponent implements OnInit {
  players: Player[] = [];
  newPlayer: Partial<Player> = {};
  imagePreview: string | ArrayBuffer | null = null;
  showModal: boolean = false; // Controla la visibilidad del modal
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  trainingDays: { date: Date, cancelled: boolean }[] = [];

  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    this.players = this.playerService.getPlayers(); // Cargar jugadores
    this.generateTrainingDays(); // Generar los días de entrenamiento hasta la fecha actual
  }

  // Generar los días de entrenamiento desde 05/09/2024 hasta el día de hoy
  generateTrainingDays() {
    this.trainingDays = [];
    const startDate = new Date(2024, 8, 5); // 05 de septiembre de 2024
    const today = new Date(); // Fecha actual
    let currentDate = new Date(startDate);

    while (currentDate <= today) {
      const dayOfWeek = currentDate.getDay();
      const currentMonth = currentDate.getMonth();

      // Regla para septiembre: solo martes (2) y jueves (4)
      if (currentMonth === 8 && (dayOfWeek === 2 || dayOfWeek === 4)) {
        this.trainingDays.push({ date: new Date(currentDate), cancelled: false });
      }
      // A partir de octubre: martes (2), jueves (4) y viernes (5)
      else if (currentMonth >= 9 && (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 5)) {
        this.trainingDays.push({ date: new Date(currentDate), cancelled: false });
      }

      // Incrementar el día
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aplicar los días cancelados desde LocalStorage
    this.applyCancelledTrainings();
  }

  // Aplicar entrenamientos cancelados desde LocalStorage
  applyCancelledTrainings() {
    const storedTrainings = this.playerService.getTrainingDays();
    this.trainingDays = this.trainingDays.map(day => {
      const storedDay = storedTrainings.find(stored => this.formatDate(new Date(stored.date)) === this.formatDate(day.date));
      if (storedDay) {
        return { ...day, cancelled: storedDay.cancelled };
      }
      return day;
    });
  }

  // Obtener el número de entrenamientos a los que ha asistido un jugador
  getPlayerAttendance(player: Player): number {
    return this.trainingDays.filter(day => !day.cancelled && player.attendance[this.formatDate(day.date)]).length;
  }

  // Obtener el total de entrenamientos hasta el día actual (excluyendo los cancelados)
  getTotalTrainings(): number {
    return this.trainingDays.filter(day => !day.cancelled).length;
  }

  // Obtener jugadores y ordenarlos por posición
  get playersSorted() {
    return this.playerService.getPlayers().sort((a, b) => this.comparePositions(a.position, b.position));
  }

  // Función para comparar posiciones: Base > Exterior > Interior
  comparePositions(posA: string, posB: string): number {
    const order = ['Base', 'Exterior', 'Interior'];
    return order.indexOf(posA) - order.indexOf(posB);
  }

  addPlayer() {
    const newId = Date.now();  // Usamos Date.now() para asegurarnos de tener un id único
    const player: Player = {
      id: newId,
      firstName: this.newPlayer.firstName!,
      lastName: this.newPlayer.lastName!,
      position: this.newPlayer.position!,
      dorsal: this.newPlayer.dorsal!,
      image: this.imagePreview || null,
      attendance: {}
    };

    this.playerService.addPlayer(player);
    this.newPlayer = {}; // Limpiar el formulario
    this.imagePreview = null;
    this.closeModal(); // Cerrar el modal al agregar el jugador
  }

  // Eliminar jugador
  removePlayer(playerId: number) {
    this.playerService.removePlayer(playerId);
    this.players = this.players.filter(player => player.id !== playerId);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Formatear fecha a DD/MM/YYYY
  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Abrir el modal
  openModal() {
    this.showModal = true;
  }

  // Cerrar el modal
  closeModal() {
    this.showModal = false;
  }
}
