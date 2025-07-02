import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-table.component.html',
})
export class GameTableComponent {
  @Input() rival: string = '';
  @Input() jugadores: any[] = [];

  @Output() cerrar = new EventEmitter<void>();

  cerrarTabla() {
    this.cerrar.emit();
  }
}
