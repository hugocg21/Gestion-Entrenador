import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  DocumentData,
} from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { TeamSelectionService } from '../../services/team-selection.service';

@Component({
  selector: 'app-team-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-dashboard.component.html',
})
export class TeamDashboardComponent {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router);

  teams: any[] = [];
  newTeamName = '';
  newTeamCategory = '';
  loading = true;
  showForm = false;

  async ngOnInit() {
    const username = this.authService.getUsername();
    if (!username) return;

    const teamsRef = collection(this.firestore, `users/${username}/teams`);
    collectionData(teamsRef, { idField: 'id' }).subscribe((teams) => {
      this.teams = teams;
      this.loading = false;
    });
  }

  async createTeam() {
    const username = this.authService.getUsername();
    if (!username || !this.newTeamName.trim()) return;

    const teamsRef = collection(this.firestore, `users/${username}/teams`);
    await addDoc(teamsRef, {
      name: this.newTeamName.trim(),
      category: this.newTeamCategory.trim(),
      createdAt: new Date(),
    });

    // limpia el formulario
    this.newTeamName = '';
    this.newTeamCategory = '';
    this.showForm = false; // ⬅️ cierra el modal
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  private teamSel = inject(TeamSelectionService); // ← inyecta

  selectTeam(team: any) {
    const username = this.authService.getUsername();
    if (!username) {
      console.error('❌ No hay username disponible');
      return;
    }

    console.log('[TRACE] Equipo seleccionado:', team);
    this.teamSel.setSelectedTeam(team.id, username, team);
    this.router.navigate(['/app']);
  }
}
