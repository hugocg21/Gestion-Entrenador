import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByNombre',
  standalone: true,
})
export class FilterByNombrePipe implements PipeTransform {
  transform(jugadores: any[], texto: string): any[] {
    if (!texto) return jugadores;
    const filtro = texto.toLowerCase();
    return jugadores.filter((j) => j.nombre.toLowerCase().includes(filtro));
  }
}
