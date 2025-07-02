import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TeamSelectionService {
  /** `true` cuando hay equipo seleccionado */
  private selected$ = new BehaviorSubject<boolean>(
    !!localStorage.getItem('selectedTeamId')
  );

  selectedTeam$ = this.selected$.asObservable();

  /** Guarda en localStorage y notifica a los suscriptores */
  setSelectedTeam(id: string) {
    localStorage.setItem('selectedTeamId', id);
    this.selected$.next(true);
  }

  /** Borra la selección (por si hicieras logout o cambias de equipo) */
  clearSelection() {
    localStorage.removeItem('selectedTeamId');
    this.selected$.next(false);
  }
}
