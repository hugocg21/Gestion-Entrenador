export interface Game {
  id: number;
  date: string;
  time: string;
  location: string;
  opponent: string;
  selectedPlayers: number[]; // IDs de jugadores seleccionados
}
