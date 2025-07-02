import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent {
  @Input() visible = false;
  @Input() mensaje = '';
  @Input() tipo: 'success' | 'error' = 'success';

  get colorClass() {
    return this.tipo === 'success' ? 'bg-green-600' : 'bg-red-600';
  }
}
