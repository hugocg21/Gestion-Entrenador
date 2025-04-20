import { Component, OnInit } from '@angular/core';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'players-list',
  templateUrl: './players-list.component.html'
})
export class PlayersListComponent implements OnInit {
  players: Player[] = []; //Lista de jugadores con objetos Player
  newPlayer: Partial<Player> = {}; //Objeto Player para la creación de jugadores
  imagePreview: string | ArrayBuffer | null = null; //Objeto para introducir la imagen del jugador
  showModal: boolean = false; //Booleano para mostrar u ocultar el modal de creación de jugadores
  currentMonth: number = new Date().getMonth(); //Variable numérica que guarda el número del mes actual
  currentYear: number = new Date().getFullYear(); //Variable numérica que guarda el número del año actual
  trainingDays: { date: Date }[] = []; //Lista que almacena los días de entrenamiento
  editing: boolean = false; // Indica si estás en modo edición
  currentPlayer: Player | null = null; // Jugador que se está editando

  //Constructor que crea un objeto del PlayerService
  constructor(private playerService: PlayerService, private themeService: ThemeService) {}

  ngOnInit(): void {
    // Nos suscribimos al Observable que retorna el servicio y asignamos los jugadores
    this.playerService.getPlayers().subscribe(players => {
      this.players = players;
      this.generateTrainingDays(); // Llamamos al método para generar los días de entrenamientos
    });

    // Escuchar los cambios en el modo oscuro
    this.themeService.isDarkMode$.subscribe((isDarkMode) => {
      this.isDarkMode = isDarkMode;
    });
  }

  generateTrainingDays() {
    this.trainingDays = [];
    const startDate = new Date(2024, 8, 5); // Fecha de inicio de entrenamientos (5 de septiembre de 2024)
    const today = new Date(); // Fecha actual
    let currentDate = new Date(startDate); // Empezamos desde la fecha de inicio

    // Fechas excluidas
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
      new Date(2025, 0, 3), // 3 de enero
      new Date(2025, 0, 17), // 17 de enero
      new Date(2025, 1, 14), // 14 de febrero
      new Date(2025, 1, 21), // 21 de febrero
      new Date(2025, 1, 28), // 28 de febrero
      new Date(2025, 2, 4), // 4 de marzo
      new Date(2025, 2, 28), // 28 de marzo
      new Date(2025, 3, 1), // 1 de abril
      new Date(2025, 3, 15), // 15 de abril
      new Date(2025, 3, 17), // 17 de abril
      new Date(2025, 3, 18), // 18 de abril
    ];

    while (currentDate <= today) {
      const dayOfWeek = currentDate.getDay(); // Día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Reglas de entrenamiento
      if (
        (currentMonth === 8 && (dayOfWeek === 2 || dayOfWeek === 4) && currentYear === 2024) || // Septiembre: martes y jueves
        (currentMonth >= 9 && (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 5) && currentYear === 2024) || // Octubre en adelante: martes, jueves y viernes
        (currentMonth >= 0 && (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 5) && currentYear === 2025) // Octubre en adelante: martes, jueves y viernes
      ) {
        // Excluimos las fechas específicas
        if (!excludedDates.some(d => d.getTime() === currentDate.getTime())) {
          this.trainingDays.push({ date: new Date(currentDate) });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1); // Avanzamos al siguiente día
    }

    // Agregar días específicos de entrenamiento
    const specificDates = [new Date(2025, 0, 8)]; // Agregamos el 8 de enero de 2025
    specificDates.forEach(specificDate => {
      if (!this.trainingDays.some(day => day.date.getTime() === specificDate.getTime())) {
        this.trainingDays.push({ date: specificDate });
      }
    });

    console.log('Training days:', this.trainingDays.map(day => this.formatDate(day.date)));
  }

  //Método para obtener los entrenamientos a los que ha asistido cada jugador
  getPlayerAttendance(player: Player): number {
    if (!player.attendance) return 0; // Si no hay datos, retorna 0
    return Object.values(player.attendance).filter(attended => attended === true).length;
  }

  // Método modificado para obtener el total de entrenamientos aplicable a cada jugador individualmente
  getTotalTrainings(player: Player): number {
    return this.trainingDays.filter(day => {
      const dayDate = new Date(day.date);
      const dayOfWeek = dayDate.getDay();

      // Regla específica para Miyan
      if (player.firstName === 'Miyan') {
        const cutoffDate = new Date(2024, 10, 6);
        if (dayDate < cutoffDate && dayOfWeek !== 4) {
          return false; // Antes del 6 de noviembre, solo jueves
        } else if (dayDate >= cutoffDate && ![2, 4].includes(dayOfWeek)) {
          return false; // A partir del 6 de noviembre, martes y jueves
        }
      }

      // Regla específica para Rodri
      if (player.firstName === 'Rodri') {
        const startDate = new Date(2024, 9, 8);
        if (dayDate < startDate) {
          return false; // Solo cuenta desde el 8 de octubre
        }
      }

      // Regla específica para Jaime
      if (player.firstName === 'Jaime' && dayOfWeek === 5) {
        return false; // Excluir los viernes
      }

      if (player.firstName === 'Pesca' && dayOfWeek === 5 && dayDate >= new Date(2025, 0, 24)) {
        return false; // Excluir los viernes desde el 24 de enero
      }

      return true; // Si pasa todas las reglas
    }).length;
  }

  // Método para calcular el porcentaje de asistencia
  calculateAttendancePercentage(player: Player): number {
    const totalTrainings = this.getTotalTrainings(player);
    const attendance = this.getPlayerAttendance(player);
    return totalTrainings > 0 ? Math.round((attendance / totalTrainings) * 100) : 0;
  }

  //Método para ordenar a los jugadores según sus posiciones
  get playersSorted() {
    this.sortPlayers(); // Ordena los jugadores según la categoría y dirección
    return this.players;
  }

  //Método para comparar y ordenar a los jugadores según su posición
  comparePositions(posA: string, posB: string): number {
    const order = ['Base', 'Exterior', 'Interior'];
    return order.indexOf(posA) - order.indexOf(posB);
  }

  //Método para crear a un jugador nuevo
  addPlayer() {
    if (this.editing && this.currentPlayer) {
      // Actualizar el jugador existente
      this.currentPlayer.firstName = this.newPlayer.firstName!;
      this.currentPlayer.position = this.newPlayer.position!;
      this.currentPlayer.dorsal = this.newPlayer.dorsal!;
      this.currentPlayer.image = this.imagePreview || this.currentPlayer.image;

      this.playerService.updatePlayer(this.currentPlayer); // Método para actualizar en el servicio
    } else {
      // Crear un jugador nuevo
      const newId = Date.now();
      const player: Player = {
        id: newId,
        firstName: this.newPlayer.firstName!,
        position: this.newPlayer.position!,
        dorsal: this.newPlayer.dorsal!,
        image: this.imagePreview || null,
        attendance: {},
        gameMinutes: {}
      };

      this.playerService.addPlayer(player);
    }

    // Limpiar el estado y cerrar el modal
    this.newPlayer = {};
    this.imagePreview = null;
    this.editing = false;
    this.currentPlayer = null;
    this.closeModal();
  }

  //Método para eliminar al jugador
  removePlayer(playerId: number) {
    // Convertimos el ID a string antes de llamar al servicio
    this.playerService.removePlayer(playerId.toString())
      .then(() => {
        // Filtrar la lista local de jugadores después de eliminar
        this.players = this.players.filter(player => player.id !== playerId);
      })
      .catch(error => console.error('Error al eliminar el jugador:', error));
  }

  //Método para abrir el explorador de Windows para seleccionar la imagen del jugador
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

  //Método para formatear la fecha y mostrarla como dia/mes/año
  formatDate(date: Date): string {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
  }

  //Métodos para abrir el modal de creación de jugadores
  openModal(playerToEdit?: Player) {
    if (playerToEdit) {
      this.editing = true;
      this.currentPlayer = playerToEdit;
      this.newPlayer = {
        firstName: playerToEdit.firstName,
        position: playerToEdit.position,
        dorsal: playerToEdit.dorsal
      };
      this.imagePreview = playerToEdit.image;
    } else {
      this.editing = false;
      this.currentPlayer = null;
      this.newPlayer = {};
      this.imagePreview = null;
    }
    this.showModal = true;
  }

  //Método para cerrar el modal de creación de jugadores
  closeModal() {
    this.showModal = false;
  }

  // Variables para el orden
  orderCategory: string = 'position';  // Categoría de ordenación por defecto
  orderDirection: 'asc' | 'desc' = 'asc'; // Dirección del orden (ascendente por defecto)

  // Método para cambiar la categoría de ordenación
  changeOrderCategory(category: string) {
    if (this.orderCategory === category) {
      // Si la categoría actual es la misma que la nueva, se cambia la dirección
      this.orderDirection = this.orderDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Si la categoría cambia, se ordena en ascendente
      this.orderCategory = category;
      this.orderDirection = 'asc';
    }
    this.sortPlayers(); // Ordenar los jugadores
  }

  // Método para ordenar los jugadores según la categoría y dirección
  sortPlayers() {
    this.players.sort((a, b) => {
      let comparison = 0;
      // Compara según la categoría
      if (this.orderCategory === 'attendance') {
        comparison = this.calculateAttendancePercentage(a) - this.calculateAttendancePercentage(b);
      } else if (this.orderCategory === 'name') {
        comparison = a.firstName.localeCompare(b.firstName);
      } else if (this.orderCategory === 'dorsal') {
        comparison = a.dorsal - b.dorsal;
      } else if (this.orderCategory === 'position') {
        comparison =  this.comparePositions(a.position, b.position);
      }

      // Si la dirección es descendente, invertir el resultado de la comparación
      return this.orderDirection === 'asc' ? comparison : -comparison;
    });
  }

  isDarkMode: boolean = false;

  toggleDarkMode() {
    this.themeService.toggleDarkMode(); // Cambiar el tema
  }
}
