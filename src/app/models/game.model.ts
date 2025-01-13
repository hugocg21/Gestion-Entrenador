export interface Game {
  id: number;
  date: string;
  time: string;
  location: string;
  opponent: string;
  ownPoints: number;
  opponentPoints: number;
  playerMinutes: {
    [playerId: string]: {
      minutes: number;
      points: number;
      fouls: number;
      freeThrows: { made: number; attempted: number };
      efficiency: number;
    };
  };
}
