import { Component, input } from '@angular/core';

/** Mensagem reutilizável para listas/tabelas sem itens. */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyStateComponent {
  readonly mensagem = input<string>('Nenhum item encontrado.');
}
