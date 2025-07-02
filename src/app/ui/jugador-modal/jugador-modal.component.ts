import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
// import {
//   ApexChart,
//   ApexAxisChartSeries,
//   ApexXAxis,
//   ApexTitleSubtitle,
//   ApexTooltip, // <-- ✅ AÑADE ESTO
//   NgApexchartsModule,
// } from 'ng-apexcharts';

@Component({
  selector: 'app-jugador-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jugador-modal.component.html',
  styleUrls: ['./jugador-modal.component.css'],
})
export class JugadorModalComponent implements OnChanges {
  @Input() jugador: any = null;
  @Input() partidos: any[] = [];
  @Output() cerrar = new EventEmitter<void>();

  modoVista: 'tabla' | 'grafico' = 'tabla';
  tipoGrafico: 'line' | 'bar' = 'bar';

  // chartOptions: {
  //   series: ApexAxisChartSeries;
  //   chart: ApexChart;
  //   xaxis: ApexXAxis;
  //   title: ApexTitleSubtitle;
  //   tooltip?: ApexTooltip;
  // } = {
  //   series: [],
  //   chart: { type: 'line', height: 350 },
  //   xaxis: { categories: [] },
  //   title: { text: '' },
  // };

  metricas = [
    { clave: 'puntos', label: 'Puntos', icon: '🏀' },
    { clave: 'aciertos_t2', label: 'Tiros 2P', icon: '🎯' },
    { clave: 'aciertos_t3', label: 'Triples', icon: '🎯' },
    { clave: 'aciertos_tl', label: 'Tiros Libres', icon: '🎯' },
    { clave: 'minutos', label: 'Minutos', icon: '⏱️' },
    { clave: 'faltas_cometidas', label: 'Faltas', icon: '🚫' },
    { clave: 'valoracion', label: 'Valoración', icon: '📈' },
  ];

  metricaSeleccionada = 'puntos';
  // tooltipOptions: ApexTooltip = {};
  dataLabelsOptions: any = {}; // se usará como [dataLabels] en el gráfico

  cerrarModal() {
    this.cerrar.emit();
  }

  cambiarVista(vista: 'tabla' | 'grafico') {
    this.modoVista = vista;
    if (vista === 'grafico') this.actualizarGrafico();
  }

  cambiarMetrica(metrica: string) {
    this.metricaSeleccionada = metrica;
    this.actualizarGrafico();
  }

  cambiarTipoGrafico(tipo: 'line' | 'bar') {
    this.tipoGrafico = tipo;
    this.actualizarGrafico();
  }

  ngOnChanges() {
    if (this.partidos && this.jugador?.nombre) {
      const jugadorNombre = this.normalize(this.jugador.nombre);

      for (let partido of this.partidos) {
        const mvpNombre = this.normalize(partido.mvp || '');
        partido.esMVP = jugadorNombre === mvpNombre;
      }

      this.actualizarGrafico(); // si tienes esta función, mantenla
    }
  }

  normalize(nombre: string): string {
    return nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  actualizarGrafico() {
    let data: number[] = [];
    let titulo = '';
    // let tooltipCustom: ApexTooltip | undefined = undefined;

    // Reset data labels por defecto
    this.dataLabelsOptions = {};

    switch (this.metricaSeleccionada) {
      case 'minutos':
        data = this.partidos.map(
          (p) => +(this.minutosASegundos(p.minutos || '00:00') / 60).toFixed(2)
        );
        titulo = 'Minutos';
        break;

      case 'aciertos_t2':
        data = this.partidos.map((p) => this.sumarAciertos(p.tiros_2p));
        titulo = 'Tiros de 2 (aciertos)';
        // tooltipCustom = this.generarTooltipPersonalizado('tiros_2p');
        break;

      case 'aciertos_t3':
        data = this.partidos.map((p) => this.sumarAciertos(p.triples));
        titulo = 'Triples (aciertos)';
        // tooltipCustom = this.generarTooltipPersonalizado('triples');
        break;

      case 'aciertos_tl':
        data = this.partidos.map((p) => this.sumarAciertos(p.tiros_libres));
        titulo = 'Tiros libres';
        // tooltipCustom = this.generarTooltipPersonalizado('tiros_libres');

        // ✅ Mostrar 3/4 sobre la barra
        this.dataLabelsOptions = {
          enabled: true,
          formatter: (_val: number, opts: any) => {
            const partido = this.partidos[opts.dataPointIndex];
            const aciertos = this.sumarAciertos(partido.tiros_libres);
            const intentos = this.sumarIntentos(partido.tiros_libres);
            return `${aciertos}/${intentos}`;
          },
          style: {
            fontSize: '12px',
          },
        };
        break;

      default:
        data = this.partidos.map(
          (p) => Number(p[this.metricaSeleccionada]) || 0
        );
        titulo =
          this.metricaSeleccionada.charAt(0).toUpperCase() +
          this.metricaSeleccionada.slice(1);
        break;
    }

    // this.chartOptions = {
    //   series: [{ name: this.metricaSeleccionada, data }],
    //   chart: { type: this.tipoGrafico, height: 350 },
    //   xaxis: { categories: this.partidos.map((p) => p.rival || p.fecha) },
    //   title: { text: titulo },
    // };

    // this.tooltipOptions = tooltipCustom || {};
  }

  generarTooltipPersonalizado(campo: 'tiros_2p' | 'triples' | 'tiros_libres') {
    return {
      y: {
        formatter: (_value: number, { dataPointIndex }: any) => {
          const partido = this.partidos[dataPointIndex];
          const metidos = this.sumarAciertos(partido[campo]);
          const intentos = this.sumarIntentos(partido[campo]);
          const porcentaje =
            intentos > 0 ? ((metidos / intentos) * 100).toFixed(1) : '0';
          return `${metidos}/${intentos} (${porcentaje}%)`;
        },
      },
    };
  }

  calcularTotales(partidos: any[]) {
    if (!Array.isArray(this.partidos)) return;
    const totales = {
      partidos: partidos.length,
      puntos: 0,
      tiros_2p: 0,
      triples: 0,
      tl_metidos: 0,
      tl_tirados: 0,
      faltas_cometidas: 0,
      valoracion: 0,
      segundos: 0,
    };

    for (const p of partidos) {
      totales.puntos += Number(p.puntos || 0);
      totales.tiros_2p += this.sumarAciertos(p.tiros_2p);
      totales.triples += this.sumarAciertos(p.triples);
      totales.tl_metidos += this.sumarAciertos(p.tiros_libres);
      totales.tl_tirados += this.sumarIntentos(p.tiros_libres);
      totales.faltas_cometidas += Number(p.faltas_cometidas || 0);
      totales.valoracion += Number(p.valoracion || 0);
      totales.segundos += this.minutosASegundos(p.minutos);
    }

    const promedio = (v: number) => (v / totales.partidos).toFixed(2);

    return {
      ...totales,
      prom_puntos: promedio(totales.puntos),
      prom_t2: promedio(totales.tiros_2p),
      prom_t3: promedio(totales.triples),
      prom_faltas: promedio(totales.faltas_cometidas),
      prom_valoracion: promedio(totales.valoracion),
      prom_minutos: this.formatoMinutos(totales.segundos / totales.partidos),
      minutos_totales: this.formatoMinutos(totales.segundos),
      prom_tl_metidos: promedio(totales.tl_metidos), // Solo tiros libres anotados
      prom_tl_tirados: promedio(totales.tl_tirados), // Solo tiros libres anotados
      tl: `${totales.tl_metidos}/${totales.tl_tirados}`,
      porcentaje_tl:
        totales.tl_tirados > 0
          ? Math.round((totales.tl_metidos / totales.tl_tirados) * 100)
          : 0,
    };
  }

  sumarAciertos(valor: string): number {
    if (!valor || !valor.includes('/')) return 0;
    const [metidos] = valor.split('/').map((v) => parseInt(v));
    return metidos || 0;
  }

  sumarIntentos(valor: string): number {
    if (!valor || !valor.includes('/')) return 0;
    const [, intentos] = valor.split('/').map((v) => parseInt(v));
    return intentos || 0;
  }

  minutosASegundos(min: string): number {
    if (!min || !min.includes(':')) return 0;
    const [m, s] = min.split(':').map((v) => parseInt(v));
    return m * 60 + s;
  }

  formatoMinutos(seg: number): string {
    const m = Math.floor(seg / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(seg % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  }

  calcularPorcentaje(valor: string): string {
    if (!valor || !valor.includes('/')) return '0';
    const [m, i] = valor.split('/').map(Number);
    if (!i) return '0';
    return ((m / i) * 100).toFixed(1);
  }
}
