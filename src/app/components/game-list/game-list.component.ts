import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterByRivalFechaPipe } from '../../pipes/filter-by-rival-fecha.pipe';

import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterByRivalFechaPipe],
  templateUrl: './game-list.component.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '200ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateY(10px)' })
        ),
      ]),
    ]),
  ],
})
export class GameListComponent {
  @Input() partidos: any[] = [];
  @Output() ver = new EventEmitter<any>();
  @Output() eliminar = new EventEmitter<string>();
  @Output() actualizar = new EventEmitter<any>();

  editandoId: string | null = null;
  fechaEditada: string = '';
  filtroPartido: string = '';

  editar(partido: any) {
    this.editandoId = partido.id;
    this.fechaEditada = partido.fecha;
  }

  cancelar() {
    this.editandoId = null;
    this.fechaEditada = '';
  }

  guardarCambios(partido: any) {
    const actualizado = { ...partido, fecha: this.fechaEditada };
    this.actualizar.emit(actualizado);
    this.cancelar();
  }

  mostrarLista: boolean = false;

  toggleLista() {
    this.mostrarLista = !this.mostrarLista;
  }

  get partidosGanados() {
    return this.partidos.filter(
      (p) => p.resultado && p.resultado.estudiantes > p.resultado.rival
    ).length;
  }

  get partidosPerdidos() {
    return this.partidos.filter(
      (p) => p.resultado && p.resultado.estudiantes < p.resultado.rival
    ).length;
  }
}
