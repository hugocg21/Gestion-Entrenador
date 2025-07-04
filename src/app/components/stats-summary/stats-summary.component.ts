import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FilterByNombrePipe } from '../../pipes/filter-by-nombre.pipe';
import { GamesService } from '../../services/games.service';
import { JugadorModalComponent } from '../../ui/jugador-modal/jugador-modal.component';

import { Firestore } from '@angular/fire/firestore'; // ✅ import correcto
import { TeamSelectionService } from '../../services/team-selection.service';

@Component({
  selector: 'app-stats-summary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FilterByNombrePipe,
    JugadorModalComponent,
  ],
  templateUrl: './stats-summary.component.html',
})
export class StatsSummaryComponent implements OnInit {
  private firestore = inject(Firestore); // ahora sí tiene provider

  jugadores = signal<any[]>([]);
  totales = signal<any>({});
  filtroNombre = signal('');
  ordenActual = signal('numero');
  ordenAscendente = signal(true);

  constructor(private partidosService: GamesService, private teamService: TeamSelectionService) {
    console.log('[StatsSummaryComponent] Firestore:', this.firestore);
  }

  async ngOnInit() {
    const teamData = this.teamService.getSelectedTeamData();
    console.log('🏀 Nombre del equipo:', teamData?.name);

    try {
      const jugadores = await this.partidosService.getEstadisticasAcumuladas();

      const filtrados = jugadores.filter(
        (j: any) =>
          j.nombre &&
          j.nombre.trim().toLowerCase() !== 'nombre' &&
          j.nombre.toLowerCase() !== 'totales'
      );

      filtrados.forEach((j: any) => {
        j.prom_puntos = (j.puntos / j.partidos).toFixed(2);
        j.prom_tiros_2p = (j.tiros_2p / j.partidos).toFixed(2);
        j.prom_triples = (j.triples / j.partidos).toFixed(2);
        j.prom_valoracion = (j.valoracion / j.partidos).toFixed(2);
        j.minutos_totales = this.partidosService.formatMinutos(
          j.segundos_jugados
        );
        j.prom_minutos = this.partidosService.formatMinutos(
          j.segundos_jugados / j.partidos
        );
        j.tl_porcentaje =
          j.tl_tirados > 0
            ? ((j.tl_metidos / j.tl_tirados) * 100).toFixed(1)
            : '0';
        j.prom_faltas = (j.faltas_cometidas / j.partidos).toFixed(2);
      });

      filtrados.sort(
        (a: any, b: any) => parseInt(a.numero) - parseInt(b.numero)
      );

      this.jugadores.set(filtrados);
      this.ordenActual.set('numero');
      this.ordenAscendente.set(true);

      const pj = filtrados[0]?.partidos || 1;
      const segundos = filtrados.reduce(
        (a: any, j: { segundos_jugados: any }) => a + j.segundos_jugados,
        0
      );
      const tl = filtrados.reduce(
        (a: any, j: { tl_metidos: any }) => a + j.tl_metidos,
        0
      );
      const tlTirados = filtrados.reduce(
        (a: any, j: { tl_tirados: any }) => a + j.tl_tirados,
        0
      );

      this.totales.set({
        puntos: filtrados.reduce(
          (a: any, j: { puntos: any }) => a + j.puntos,
          0
        ),
        tiros_2p: filtrados.reduce(
          (a: any, j: { tiros_2p: any }) => a + j.tiros_2p,
          0
        ),
        triples: filtrados.reduce(
          (a: any, j: { triples: any }) => a + j.triples,
          0
        ),
        tiros_libres: tl,
        tiros_libres_tirados: tlTirados,
        faltas_cometidas: filtrados.reduce(
          (a: any, j: { faltas_cometidas: any }) => a + j.faltas_cometidas,
          0
        ),
        valoracion: filtrados.reduce(
          (a: any, j: { valoracion: any }) => a + j.valoracion,
          0
        ),
        mvps: filtrados.reduce(
          (a: any, j: { mvps: any }) => a + (j.mvps || 0),
          0
        ),
        partidos: pj,
        segundos,
        minutos_jugados: this.partidosService.formatMinutos(segundos),
        prom_puntos: (
          filtrados.reduce((a: any, j: { puntos: any }) => a + j.puntos, 0) / pj
        ).toFixed(2),
        prom_t2: (
          filtrados.reduce(
            (a: any, j: { tiros_2p: any }) => a + j.tiros_2p,
            0
          ) / pj
        ).toFixed(2),
        prom_t3: (
          filtrados.reduce((a: any, j: { triples: any }) => a + j.triples, 0) /
          pj
        ).toFixed(2),
        prom_faltas: (
          filtrados.reduce(
            (a: any, j: { faltas_cometidas: any }) => a + j.faltas_cometidas,
            0
          ) / pj
        ).toFixed(2),
        prom_valoracion: (
          filtrados.reduce(
            (a: any, j: { valoracion: any }) => a + j.valoracion,
            0
          ) / pj
        ).toFixed(2),
        prom_minutos_jugados: this.partidosService.formatMinutos(segundos / pj),
        tl_porcentaje:
          tlTirados > 0 ? ((tl / tlTirados) * 100).toFixed(1) : '0',
      });
    } catch (err) {
      console.error('❌ Error al cargar estadísticas', err);
    }
  }

  ordenarPor(campo: string) {
    if (this.ordenActual() === campo) {
      this.ordenAscendente.set(!this.ordenAscendente());
    } else {
      this.ordenActual.set(campo);
      this.ordenAscendente.set(true);
    }

    const lista = [...this.jugadores()];
    lista.sort((a, b) => {
      const valA = a[campo];
      const valB = b[campo];
      return this.ordenAscendente() ? valA - valB : valB - valA;
    });
    this.jugadores.set(lista);
  }

  get resumenJugadores() {
    return this.jugadores();
  }

  get resumenTotales() {
    return this.totales();
  }

  jugadorSeleccionado = signal<any | null>(null); // ✅ Signal para el modal

  abrirDetalle(jugador: any) {
    console.log('[📥 abrirDetalle] Jugador seleccionado:', jugador.nombre);

    this.partidosService
      .getPartidosJugador(jugador.nombre)
      .then((todosLosPartidos) => {
        console.log('[📄 Partidos obtenidos]', todosLosPartidos);

        const normSel = this.normalize(jugador.nombre);

        const partidos = todosLosPartidos
          .map((p, idx) => {
            const stats = (p.jugadores || []).find(
              (jg: any) => this.normalize(jg.nombre) === normSel
            );

            if (!stats) {
              console.warn(
                `[⚠️ Partido ${idx}] No se encontró el jugador en ${p.fecha} ` +
                  'Rival:',
                p.resultado?.rival || p.rival
              );
              return null;
            }

            return {
              ...stats,
              fecha: p.fecha,
              rival: p.rival || p.resultado?.rival,
              mvp: p.mvp,
            };
          })
          .filter(Boolean);

        // 🔽 Ordenar por fecha ascendente
        partidos.sort(
          (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );

        console.log('[✅ Partidos finales del jugador]', partidos);
        this.jugadorSeleccionado.set({ ...jugador, partidos });
      })
      .catch((e) =>
        console.error('❌ Error al obtener partidos del jugador:', e)
      );
  }

  // 🔧 Normaliza nombres
  normalize(nombre: string): string {
    return nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  cerrarModal() {
    this.jugadorSeleccionado.set(null);
  }
}
