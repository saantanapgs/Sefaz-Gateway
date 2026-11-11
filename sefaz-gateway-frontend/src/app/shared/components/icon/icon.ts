import { Component, computed, input } from '@angular/core';

export type NomeIcone =
  | 'plus' | 'more' | 'edit' | 'trash' | 'refresh' | 'play' | 'x' | 'eye' | 'search' | 'power';

/** Traçados (viewBox 24x24) dos ícones usados no projeto. Sem biblioteca externa. */
const TRACADOS: Record<NomeIcone, string[]> = {
  plus: ['M12 5v14', 'M5 12h14'],
  more: ['M12 5h.01', 'M12 12h.01', 'M12 19h.01'],
  edit: ['M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z'],
  trash: ['M3 6h18', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6', 'M10 11v6', 'M14 11v6'],
  refresh: ['M23 4v6h-6', 'M1 20v-6h6', 'M3.5 9a9 9 0 0 1 14.9-3.4L23 10', 'M1 14l4.6 4.4A9 9 0 0 0 20.5 15'],
  play: ['M5 3l14 9-14 9V3z'],
  x: ['M18 6L6 18', 'M6 6l12 12'],
  eye: ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  search: ['M21 21l-4.35-4.35', 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z'],
  power: ['M18.4 6.6a9 9 0 1 1-12.8 0', 'M12 2v10'],
};

@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './icon.html',
  styleUrl: './icon.css',
})
export class IconComponent {
  readonly nome = input.required<NomeIcone>();
  readonly tamanho = input(16);
  readonly tracados = computed(() => TRACADOS[this.nome()]);
}
