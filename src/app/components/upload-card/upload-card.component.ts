import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import axios from 'axios';
import { CommonModule } from '@angular/common';
import { GamesService } from '../../services/games.service';

@Component({
  selector: 'app-upload-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-card.component.html',
})
export class UploadCardComponent {
  readonly API_URL = 'https://n1tracker-backend.onrender.com';
  private gamesService = inject(GamesService);

  selectedFile: File | null = null;
  rival: string = '';
  cargando = false;
  error: string | null = null;

  @Input() tipoArchivo: string = '';
  @Output() archivoProcesado = new EventEmitter<any>();
  @Output() guardar = new EventEmitter<void>();

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
    this.error = null;
  }

  async uploadFile() {
    if (!this.selectedFile) {
      alert('Debes seleccionar un archivo válido (.xlsx o .xls)');
      return;
    }

    this.cargando = true;
    this.error = null;

    try {
      const datos = await this.gamesService.subirArchivo(this.selectedFile);
      this.tipoArchivo = datos.type || ''; // ⬅️ Guardamos el tipo
      this.archivoProcesado.emit(datos);
    } catch (error: any) {
      console.error('❌ Error al subir y guardar el archivo:', error);
      this.error = error?.message || 'Error desconocido';
      alert(this.error);
    } finally {
      this.cargando = false;
    }
  }

  guardarPartido() {
    this.guardar.emit();
  }

  mostrarContenido: boolean = false;

  toggleContenido() {
    this.mostrarContenido = !this.mostrarContenido;
  }
}
