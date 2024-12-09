export interface Player {
  id: number;
  firstName: string;
  position: string;
  image: string | ArrayBuffer | null;
  dorsal: number;
  attendance: { [key: string]: boolean };
  gameMinutes: { [gameId: string]: number };
}
