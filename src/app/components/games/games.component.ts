import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import axios from 'axios';
// import { JugadorModalComponent } from '../../ui/jugador-modal/jugador-modal.component';
import { ToastComponent } from '../../ui/toast/toast.component';
import { GameListComponent } from '../game-list/game-list.component';
import { GameTableComponent } from '../game-table/game-table.component';
import { StatsSummaryComponent } from '../stats-summary/stats-summary.component';
import { UploadCardComponent } from '../upload-card/upload-card.component';
import { GamesService } from '../../services/games.service';

@Component({
  selector: 'game',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastComponent,
    UploadCardComponent,
    GameTableComponent,
    GameListComponent,
    StatsSummaryComponent,
    // JugadorModalComponent,
  ],
  templateUrl: './games.component.html',
})
export class GamesComponent implements OnInit {
  title = 'Nº1 Stats Tracker';

  readonly API_URL = 'https://n1tracker-backend.onrender.com';

  backendReady = false;

  selectedFile: File | null = null;
  movimientos: any[] = [];
  tipoArchivo: string = '';
  equipoNombre: string = '';
  partidos: any[] = [];
  partidoSeleccionado: any = null;
  rival: string = '';
  toastVisible: boolean = false;
  toastMensaje: string = '';
  toastTipo: 'success' | 'error' = 'success';
  resumenJugadores: any[] = [];
  ordenActual: string = 'puntos';
  ordenAscendente: boolean = false;
  totales: any = {};
  resultado: string = '';

  constructor(private gamesService: GamesService) {}

  async ngOnInit() {
    this.cargarPartidos();
    this.cargarEstadisticasAcumuladas();

    // Modo oscuro persistente
    const dark = localStorage.getItem('modoOscuro') === '1';
    if (dark) document.documentElement.classList.add('dark');
  }

  async cargarPartidos() {
    const username = localStorage.getItem('username');
    const teamId = localStorage.getItem('selectedTeamId');

    if (!username || !teamId) {
      console.error('❌ No hay username o selectedTeamId');
      return;
    }

    try {
      const response = await axios.get(`${this.API_URL}/partidos`, {
        params: { username, teamId },
      });

      // 🔽 ORDENAR POR FECHA DESCENDENTE (más recientes primero)
      this.partidos = response.data.sort((a: any, b: any) => {
        return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      });

      console.log(
        '📦 Partidos cargados y ordenados desde Firestore:',
        this.partidos
      );
    } catch (error) {
      console.error('❌ Error al cargar partidos desde Firestore:', error);
    }
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadFile() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    try {
      const response = await axios.post(`${this.API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      this.movimientos = response.data.movimientos;
      this.tipoArchivo = response.data.type;
      this.equipoNombre = response.data.equipo;
      this.rival = response.data.rival;
      this.resultado = response.data.resultado;

      if (this.tipoArchivo !== 'estadisticas') {
        console.warn(
          'Este componente está diseñado solo para archivos de estadísticas'
        );
      }
    } catch (error) {
      console.error('Error al subir el archivo:', error);
    }
  }

  async guardarPartido() {
    let resultadoFinal: string | { estudiantes: number; rival: number } =
      this.resultado;

    if (typeof this.resultado === 'string' && this.resultado.includes('-')) {
      const [est, riv] = this.resultado
        .split('-')
        .map((p) => parseInt(p.trim()));
      resultadoFinal = { estudiantes: est, rival: riv };
    }

    const username = localStorage.getItem('username'); // o como lo tengas guardado
    const teamId = localStorage.getItem('selectedTeamId'); // o como lo tengas guardado

    if (!username || !teamId) {
      this.mostrarToast('❌ No hay username o teamId definidos', 'error');
      return;
    }

    const partido = {
      username,
      teamId,
      fecha: new Date().toISOString().split('T')[0],
      rival: this.rival,
      equipo: this.equipoNombre,
      jugadores: this.movimientos,
      resultado: resultadoFinal,
    };

    try {
      await axios.post(`${this.API_URL}/partidos`, partido);
      this.mostrarToast('✅ Partido guardado correctamente');
      this.cargarPartidos();
      this.cargarEstadisticasAcumuladas();
      this.cerrarEstadisticas();
    } catch (error) {
      console.error('❌ Error al guardar el partido:', error);
      this.mostrarToast('❌ Error al guardar el partido', 'error');
    }
  }

  async eliminarPartido(id: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar este partido?')) return;

    try {
      this.gamesService
        .deleteGame(id)
        .then(() => {
          this.partidos = this.partidos.filter((p) => p.id !== id);
          this.cargarEstadisticasAcumuladas();

          // Si se estaba mostrando ese partido, lo cerramos
          if (this.partidoSeleccionado?.id === id) {
            this.cerrarEstadisticas();
          }

          this.mostrarToast('🗑️ Partido eliminado correctamente');
        })
        .catch((err) => {
          this.mostrarToast('❌ No se pudo eliminar el partido', 'error');
        });
    } catch (error) {
      console.error('Error al eliminar el partido:', error);
      this.mostrarToast('❌ No se pudo eliminar el partido', 'error');
    }
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

  async cargarEstadisticasAcumuladas() {
    try {
      const response = await axios.get(
        `${this.API_URL}/estadisticas/acumuladas`
      );
      let jugadores = response.data;

      // Filtrar filas vacías o con "Nombre"
      jugadores = jugadores.filter(
        (j: any) =>
          j.nombre &&
          j.nombre.trim().toLowerCase() !== 'nombre' &&
          j.nombre.toLowerCase() !== 'totales'
      );

      jugadores.forEach((j: any) => {
        // (el resto ya lo tenías)
        j.prom_puntos = (j.puntos / j.partidos).toFixed(2);
        j.prom_tiros_2p = (j.tiros_2p / j.partidos).toFixed(2);
        j.prom_triples = (j.triples / j.partidos).toFixed(2);
        j.prom_valoracion = (j.valoracion / j.partidos).toFixed(2);

        // 🔢 Total de minutos jugados (formato mm:ss)
        j.minutos_totales = `${Math.floor(j.segundos_jugados / 60)
          .toString()
          .padStart(2, '0')}:${(j.segundos_jugados % 60)
          .toString()
          .padStart(2, '0')}`;

        j.prom_minutos = `${Math.floor(j.segundos_jugados / j.partidos / 60)
          .toString()
          .padStart(2, '0')}:${Math.floor(
          (j.segundos_jugados / j.partidos) % 60
        )
          .toString()
          .padStart(2, '0')}`;

        j.tl_porcentaje =
          j.tl_tirados > 0
            ? ((j.tl_metidos / j.tl_tirados) * 100).toFixed(1)
            : '0';

        j.prom_faltas = (j.faltas_cometidas / j.partidos).toFixed(2);
      });

      this.resumenJugadores = jugadores;

      this.resumenJugadores = jugadores.sort((a: any, b: any) => {
        const numA = parseInt(a.numero) || 0;
        const numB = parseInt(b.numero) || 0;
        return numA - numB;
      });
      this.ordenActual = 'numero';
      this.ordenAscendente = true;

      this.totales = {
        puntos: jugadores.reduce((a: any, j: any) => a + j.puntos, 0),
        tiros_2p: jugadores.reduce((a: any, j: any) => a + j.tiros_2p, 0),
        triples: jugadores.reduce((a: any, j: any) => a + j.triples, 0),
        tiros_libres: jugadores.reduce((a: any, j: any) => a + j.tl_metidos, 0),
        tiros_libres_tirados: jugadores.reduce(
          (a: any, j: any) => a + j.tl_tirados,
          0
        ),
        faltas_cometidas: jugadores.reduce(
          (a: any, j: any) => a + j.faltas_cometidas,
          0
        ),
        valoracion: jugadores.reduce((a: any, j: any) => a + j.valoracion, 0),
        segundos: jugadores.reduce(
          (a: any, j: any) => a + j.segundos_jugados,
          0
        ),
        mvps: jugadores.reduce((a: any, j: any) => a + j.mvps, 0),
      };

      const pjTotales = this.partidos.length || 1; // para evitar división por cero

      this.totales.prom_puntos = (this.totales.puntos / pjTotales).toFixed(2);
      this.totales.prom_t2 = (this.totales.tiros_2p / pjTotales).toFixed(2);
      this.totales.prom_t3 = (this.totales.triples / pjTotales).toFixed(2);
      this.totales.prom_faltas = (
        this.totales.faltas_cometidas / pjTotales
      ).toFixed(2);
      this.totales.prom_valoracion = (
        this.totales.valoracion / pjTotales
      ).toFixed(2);

      // Promedio de minutos jugados por partido (en segundos)
      const segundosPorPartido = this.totales.segundos / pjTotales;
      this.totales.prom_minutos_jugados = `${Math.floor(segundosPorPartido / 60)
        .toString()
        .padStart(2, '0')}:${Math.floor(segundosPorPartido % 60)
        .toString()
        .padStart(2, '0')}`;

      this.totales.partidos = this.partidos.length;
      this.totales.minutos_jugados = `${Math.floor(
        this.totales.segundos / 60
      )}:${(this.totales.segundos % 60).toString().padStart(2, '0')}`;
      this.totales.tl_porcentaje =
        this.totales.tiros_libres_tirados > 0
          ? (
              (this.totales.tiros_libres / this.totales.tiros_libres_tirados) *
              100
            ).toFixed(1)
          : '0';
    } catch (error) {
      console.error('Error al cargar estadísticas acumuladas:', error);
    }
  }

  ordenarPor(campo: string) {
    if (this.ordenActual === campo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenActual = campo;
      this.ordenAscendente = false;
    }

    this.resumenJugadores.sort((a, b) => {
      let valA = a[campo];
      let valB = b[campo];

      if (campo === 'numero') {
        valA = parseInt(valA) || 0;
        valB = parseInt(valB) || 0;
      }

      if (campo === 'nombre') {
        valA = valA?.toLowerCase() || '';
        valB = valB?.toLowerCase() || '';
        return this.ordenAscendente
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // Para minutos
      if (campo === 'prom_minutos') {
        valA = this.minutosASegundos(valA);
        valB = this.minutosASegundos(valB);
      }

      // Tiros libres metidos
      if (campo === 'tl_metidos') {
        valA = Number(valA);
        valB = Number(valB);
      }

      // % TL
      if (campo === 'tl_porcentaje') {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }

      if (campo === 'minutos_totales') {
        valA = this.minutosASegundos(valA);
        valB = this.minutosASegundos(valB);
      }

      if (campo === 'mvps') {
        valA = Number(valA);
        valB = Number(valB);
      }

      return this.ordenAscendente ? valA - valB : valB - valA;
    });
  }

  minutosASegundos(min: string): number {
    if (!min || typeof min !== 'string') return 0;
    const [m, s] = min.split(':').map((n) => parseInt(n));
    return (m || 0) * 60 + (s || 0);
  }

  aciertosPorcentaje(valor: string): number {
    if (!valor || !valor.includes('/')) return 0;
    const [aciertos, intentos] = valor.split('/').map((n) => parseInt(n));
    if (!intentos || intentos === 0) return 0;
    return aciertos / intentos;
  }

  procesarArchivo(data: any) {
    this.movimientos = data.movimientos;
    this.tipoArchivo = data.type;
    this.equipoNombre = data.equipo;
    this.rival = data.rival;
    this.resultado = data.resultado;
  }

  verEstadisticas(partido: any) {
    this.rival = partido.rival;
    this.movimientos = partido.jugadores;
    this.tipoArchivo = 'estadisticas';

    setTimeout(() => {
      const tabla = document.getElementById('tablaEstadisticas');
      tabla?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  cerrarEstadisticas() {
    this.partidoSeleccionado = null;
    this.movimientos = [];
    this.tipoArchivo = '';
    this.equipoNombre = '';
  }

  async actualizarPartido(partidoEditado: any) {
    if (!partidoEditado?.id) {
      this.mostrarToast('❌ Falta el id del partido', 'error');
      return;
    }

    try {
      await this.gamesService.patchGame(partidoEditado.id, {
        fecha: partidoEditado.fecha,
        rival: partidoEditado.rival,
        resultado: partidoEditado.resultado,
        jugadores: partidoEditado.jugadores,
      });

      this.mostrarToast('✏️ Partido actualizado');
      await this.cargarPartidos(); // refresca la lista
      await this.cargarEstadisticasAcumuladas();
    } catch (e) {
      console.error('❌ Error actualizando', e);
      this.mostrarToast('❌ Error actualizando partido', 'error');
    }
  }

  calcularTotales(jugador: any[]) {
    const total = {
      puntos: 0,
      tiros_2p: 0,
      triples: 0,
      tiros_libres: 0,
      faltas_cometidas: 0,
      valoracion: 0,
      segundos: 0,
    };

    for (const j of jugador) {
      total.puntos += +j.puntos || 0;
      total.tiros_2p += parseInt((j.tiros_2p || '0/0').split('/')[0]) || 0;
      total.triples += parseInt((j.triples || '0/0').split('/')[0]) || 0;
      total.tiros_libres +=
        parseInt((j.tiros_libres || '0/0').split('/')[0]) || 0;
      total.faltas_cometidas += +j.faltas_cometidas || 0;
      total.valoracion += +j.valoracion || 0;
      const [min, sec] = (j.minutos || '00:00').split(':').map(Number);
      total.segundos += (min || 0) * 60 + (sec || 0);
    }

    const partidos = jugador.length;
    return {
      ...total,
      partidos,
      prom_puntos: (total.puntos / partidos).toFixed(2),
      prom_t2: (total.tiros_2p / partidos).toFixed(2),
      prom_t3: (total.triples / partidos).toFixed(2),
      prom_tl: (total.tiros_libres / partidos).toFixed(2),
      prom_faltas: (total.faltas_cometidas / partidos).toFixed(2),
      prom_valoracion: (total.valoracion / partidos).toFixed(2),
      prom_minutos: `${String(
        Math.floor(total.segundos / partidos / 60)
      ).padStart(2, '0')}:${String(
        Math.floor((total.segundos / partidos) % 60)
      ).padStart(2, '0')}`,
    };
  }

  jugadorSeleccionado: any = null;
  partidosJugador: any[] = [];

  abrirModalJugador(jugador: any) {
    this.jugadorSeleccionado = jugador;

    this.gamesService
      .getPartidosJugador(jugador.nombre)
      .then((partidos) => {
        this.partidosJugador = partidos; // lista ya filtrada y ordenada
      })
      .catch((err) => {
        console.error('Error al cargar los partidos del jugador', err);
        this.mostrarToast('❌ Error cargando partidos del jugador', 'error');
        this.partidosJugador = [];
      });
  }

  cerrarModalJugador() {
    this.jugadorSeleccionado = null;
    this.partidosJugador = [];
  }

  // app.component.ts
  toggleDarkMode() {
    const html = document.documentElement;
    html.classList.toggle('dark');
    localStorage.setItem(
      'modoOscuro',
      html.classList.contains('dark') ? '1' : '0'
    );
  }

  filtroPartido: string = '';

  get partidosFiltrados() {
    const filtro = this.filtroPartido.toLowerCase().trim();
    return this.partidos.filter((p) => {
      const rival = p.rival?.toLowerCase() || '';
      const fecha = p.fecha?.toLowerCase() || '';
      return rival.includes(filtro) || fecha.includes(filtro);
    });
  }
}
