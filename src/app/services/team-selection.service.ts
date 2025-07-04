import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { inject } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';

@Injectable({ providedIn: 'root' })
export class TeamSelectionService {
  private firestore = inject(Firestore);

  private selected$ = new BehaviorSubject<boolean>(
    !!localStorage.getItem('selectedTeamId')
  );

  selectedTeam$ = this.selected$.asObservable();

  private teamData$ = new BehaviorSubject<any>(null);
  teamDataObservable$ = this.teamData$.asObservable();

  constructor() {
    const teamId = localStorage.getItem('selectedTeamId');
    const userId = localStorage.getItem('userId'); // Asegúrate de guardar esto al hacer login

    if (teamId && userId) {
      const ref = doc(this.firestore, `users/${userId}/teams/${teamId}`);
      getDoc(ref).then((snapshot) => {
        if (snapshot.exists()) {
          this.teamData$.next(snapshot.data());
        }
      });
    }
  }

  setSelectedTeam(teamId: string, userId: string, teamData?: any) {
    localStorage.setItem('selectedTeamId', teamId);
    localStorage.setItem('userId', userId);

    if (teamData) {
      this.teamData$.next(teamData);
    } else {
      const ref = doc(this.firestore, `users/${userId}/teams/${teamId}`);
      getDoc(ref).then((snapshot) => {
        if (snapshot.exists()) {
          this.teamData$.next(snapshot.data());
        }
      });
    }

    this.selected$.next(true);
  }

  getSelectedTeamData() {
    return this.teamData$.value;
  }

  clearSelection() {
    localStorage.removeItem('selectedTeamId');
    localStorage.removeItem('userId');
    this.teamData$.next(null);
    this.selected$.next(false);
  }
}
