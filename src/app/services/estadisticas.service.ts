import { Injectable, inject } from '@angular/core';
import * as XLSX from 'xlsx';
import { FirebaseGamesService } from './firebase-games.service';

export interface Jugador {
  numero: string;
  nombre: string;
  minutos: string;
  puntos: number;
  tiros_2p: string;
  porcentaje_2p: string;
  triples: string;
  porcentaje_3p: string;
  tiros_libres: string;
  porcentaje_tl: string;
  rebotes_defensivos: number;
  rebotes_ofensivos: number;
  rebotes_totales: number;
  asistencias: number;
  recuperaciones: number;
  perdidas: number;
  tapones_cometidos: number;
  tapones_recibidos: number;
  faltas_cometidas: number;
  faltas_recibidas: number;
  valoracion: number;
}

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private readonly equipoNombre = 'CB ESTUDIANTES N1 GIJON';
  private firebaseGamesService = inject(FirebaseGamesService);

  constructor() {}

  procesarArchivo(
    file: File,
    guardarEnFirestore = false
  ): Promise<{
    equipo: string;
    rival: string;
    jugadores: Jugador[];
    resultado: string;
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const filas: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          const resultadoProcesado = this.extraerEstadisticas(filas);

          if (guardarEnFirestore) {
            const gameData = {
              equipo: resultadoProcesado.equipo,
              rival: resultadoProcesado.rival,
              resultado: resultadoProcesado.resultado,
              jugadores: resultadoProcesado.jugadores,
              fecha: new Date().toISOString(),
            };
            await this.firebaseGamesService.saveGame(gameData);
          }

          resolve(resultadoProcesado);
        } catch (error) {
          reject('Error al procesar el archivo');
        }
      };

      reader.onerror = () => reject('No se pudo leer el archivo');
      reader.readAsArrayBuffer(file);
    });
  }

  private extraerEstadisticas(data: any[][]) {
    let rival = 'Rival desconocido';
    let puntosEstudiantes = 0;
    let puntosRival = 0;
    let equipoActual = '';
    const jugadores: Jugador[] = [];

    // Buscar línea con "vs"
    const lineaVs = data.find(
      (row) =>
        Array.isArray(row) &&
        row.some(
          (cell) =>
            typeof cell === 'string' && cell.toLowerCase().includes(' vs ')
        )
    );

    if (lineaVs) {
      const texto = lineaVs.find((cell: string) =>
        cell.toLowerCase().includes(' vs ')
      );
      const partes = texto.split(/vs/i);
      if (partes.length === 2) {
        const ladoIzq = partes[0].replace('Estadisticas -', '').trim();
        const ladoDer = partes[1].split(' -')[0].trim();
        rival =
          ladoIzq.toUpperCase() === this.equipoNombre.toUpperCase()
            ? ladoDer
            : ladoIzq;
      }
    }

    for (const row of data) {
      if (!Array.isArray(row)) continue;

      const celda0 = (row[0] ?? '').toString().trim();
      const celda1 = (row[1] ?? '').toString().trim();

      if (
        celda0 &&
        celda0 === celda0.toUpperCase() &&
        celda0.includes(' ') &&
        celda0.length > 3
      ) {
        equipoActual = celda0;
        continue;
      }

      if (celda1.toUpperCase() === 'TOTALES') {
        const puntos = parseInt(row[3]) || 0;
        if (equipoActual.toUpperCase() === this.equipoNombre.toUpperCase()) {
          puntosEstudiantes = puntos;
        } else {
          puntosRival = puntos;
        }
      }

      if (celda1.toLowerCase() === 'nombre') continue;
      if (equipoActual.toUpperCase() !== this.equipoNombre.toUpperCase())
        continue;
      if (!celda1) continue;

      jugadores.push({
        numero: row[0]?.toString() ?? '',
        nombre: row[1]?.toString() ?? '',
        minutos: row[2]?.toString() ?? '00:00',
        puntos: Number(row[3]) || 0,
        tiros_2p: row[4]?.toString() ?? '0/0',
        porcentaje_2p: row[5]?.toString() ?? '',
        triples: row[6]?.toString() ?? '0/0',
        porcentaje_3p: row[7]?.toString() ?? '',
        tiros_libres: row[8]?.toString() ?? '0/0',
        porcentaje_tl: row[9]?.toString() ?? '',
        rebotes_defensivos: Number(row[10]) || 0,
        rebotes_ofensivos: Number(row[11]) || 0,
        rebotes_totales: Number(row[12]) || 0,
        asistencias: Number(row[13]) || 0,
        recuperaciones: Number(row[14]) || 0,
        perdidas: Number(row[15]) || 0,
        tapones_cometidos: Number(row[16]) || 0,
        tapones_recibidos: Number(row[17]) || 0,
        faltas_cometidas: Number(row[18]) || 0,
        faltas_recibidas: Number(row[19]) || 0,
        valoracion: Number(row[20]) || 0,
      });
    }

    const resultado = `${puntosEstudiantes} - ${puntosRival}`;
    return {
      equipo: this.equipoNombre,
      rival,
      jugadores,
      resultado,
    };
  }
}
