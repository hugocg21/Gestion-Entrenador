export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  image: string | ArrayBuffer | null;
  dorsal: number; // Nuevo campo para el dorsal del jugador
  attendance: { [key: string]: boolean };
}
