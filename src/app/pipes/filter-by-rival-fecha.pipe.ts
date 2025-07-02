import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByRivalFecha',
  standalone: true,
})
export class FilterByRivalFechaPipe implements PipeTransform {
  transform(partidos: any[], texto: string): any[] {
    if (!texto) return partidos;
    const termino = texto.toLowerCase();
    return partidos.filter(
      (p) =>
        (p.rival?.toLowerCase() || '').includes(termino) ||
        (p.fecha?.toLowerCase() || '').includes(termino)
    );
  }
}
