export interface Game {
  id: number;
  date: string;
  time: string;
  location: string;
  opponent: string;
  ownPoints: number;
  opponentPoints: number;
  playerMinutes: { [playerId: string]: number };
}
