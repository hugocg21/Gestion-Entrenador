import { Component, OnInit } from '@angular/core';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';

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
  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    // Nos suscribimos al Observable que retorna el servicio y asignamos los jugadores
    this.playerService.getPlayers().subscribe(players => {
      this.players = players;
      this.generateTrainingDays(); // Llamamos al método para generar los días de entrenamientos
    });
  }

  //Método para generar los días de entrenamientos
  generateTrainingDays() {
    this.trainingDays = []; //Vaciamos la lista de días de entrenamiento
    const startDate = new Date(2024, 8, 5); //Variable para fijar la fecha de inicio de entrenamientos
    const today = new Date(); //Variable con la fecha actual
    let currentDate = new Date(startDate); //Variable que se inicializa con el día de inicios de entrenamiento y representa el día actual en el bucle, que se irá actualizando

    // Definición de fechas excluidas
    const excludedDates = [
      new Date(2024, 10, 1), // 1 de noviembre
      new Date(2024, 10, 8), // 8 de noviembre
      new Date(2024, 10, 15), // 15 de noviembre
      new Date(2024, 10, 22) // 22 de noviembre
    ];

    //Mientras el día de entrenamiento sea anterior al día actual entra en el bucle
    while (currentDate <= today) {
      const dayOfWeek = currentDate.getDay(); //Variable que obtiene el día actual de la semana
      const currentMonth = currentDate.getMonth(); //Variable que obtiene el mes actual del año

      //Bucle que añade a la lista los días que sean de entrenamiento
      //Para septiembre solo se tienen en cuenta los martes y jueves
      if (currentMonth === 8 && (dayOfWeek === 2 || dayOfWeek === 4)) {
        if (!excludedDates.some(d => d.getTime() === currentDate.getTime())) {
          this.trainingDays.push({ date: new Date(currentDate) });
        }
      }
      //Para el resto de meses se tienen en cuenta los martes, jueves y viernes
      else if (currentMonth >= 9 && (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 5)) {
        if (!excludedDates.some(d => d.getTime() === currentDate.getTime())) {
          this.trainingDays.push({ date: new Date(currentDate) });
        }
      }

      //Despues de comprobar si la fecha actual se debe incluir en la lista, se avanza al día siguiente
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  //Método para obtener los entrenamientos a los que ha asistido cada jugador
  getPlayerAttendance(player: Player): number {
    const attendanceDateStartRodri = new Date(2024, 9, 12); // Fecha desde la cual Rodri solo cuenta su asistencia
    const attendanceDateStartMiyan = new Date(2024, 10, 6); // Fecha desde la cual Rodri solo cuenta su asistencia

    return this.trainingDays.filter(day => {
      return player.attendance[this.formatDate(day.date)];
    }).length;
  }

  // Método modificado para obtener el total de entrenamientos aplicable a cada jugador individualmente
  getTotalTrainings(player: Player): number {
    const attendanceDateStartRodri = new Date(2024, 9, 8); // Fecha desde la cual Rodri solo cuenta su asistencia
    const attendanceDateStartMiyan = new Date(2024, 10, 6); // Fecha desde la cual Rodri solo cuenta su asistencia

    return this.trainingDays.filter(day => {
      const dayDate = new Date(day.date);

      // Para jugadores cadete, desde octubre solo cuentan los jueves
      if (player.position === 'Cadete' && dayDate.getDay() !== 4) {
        return false;
      }

      if (player.firstName === 'Miyan') {
        // Si la fecha es antes del 6 de noviembre de 2024
        if (dayDate < attendanceDateStartMiyan) {
          // Solo se cuentan los jueves (getDay() === 4 representa jueves)
          if (dayDate.getDay() === 4) {
            return true; // Se cuenta el jueves
          } else {
            return false; // No se cuenta si no es jueves
          }
        } else {
          // A partir del 6 de noviembre de 2024, se cuentan los martes (getDay() === 2) y jueves (getDay() === 4)
          if (dayDate.getDay() === 2 || dayDate.getDay() === 4) {
            return true; // Se cuenta si es martes o jueves
          } else {
            return false; // No se cuenta si no es martes ni jueves
          }
        }
      }

      // Para Rodri, contar solo desde el 8 de octubre
      if (player.firstName === 'Rodri' && dayDate < attendanceDateStartRodri) {
        return false;
      }

      return day;
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
    const order = ['Base', 'Escolta', 'Alero', 'Ala pivot', 'Pivot', 'Cadete'];
    return order.indexOf(posA) - order.indexOf(posB);
  }

  //Método para crear a un jugador nuevo
  addPlayer() {
    if (this.editing && this.currentPlayer) {
      // Actualizar el jugador existente
      this.currentPlayer.firstName = this.newPlayer.firstName!;
      this.currentPlayer.lastName = this.newPlayer.lastName!;
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
        lastName: this.newPlayer.lastName!,
        position: this.newPlayer.position!,
        dorsal: this.newPlayer.dorsal!,
        image: this.imagePreview || null,
        attendance: {}
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
    //Llamamos al método del service para eliminar el jugador según el playerId
    this.playerService.removePlayer(playerId);
    this.players = this.players.filter(player => player.id !== playerId);
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
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  //Métodos para abrir el modal de creación de jugadores
  openModal(playerToEdit?: Player) {
    if (playerToEdit) {
      this.editing = true;
      this.currentPlayer = playerToEdit;
      this.newPlayer = {
        firstName: playerToEdit.firstName,
        lastName: playerToEdit.lastName,
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
}
