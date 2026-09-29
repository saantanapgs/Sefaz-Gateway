import { Component, input } from '@angular/core';

export type StatCardVariante = 'neutro' | 'sucesso' | 'perigo' | 'alerta';

/**
 * Card de indicador reutilizável (ex.: "Total de gateways", "Ativos").
 * Não conhece Gateway nem nenhuma feature específica — recebe só um rótulo
 * e um valor, por isso serve pra qualquer dashboard futura (Backend, etc.).
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCardComponent {
  readonly rotulo = input.required<string>();
  readonly valor = input.required<string | number>();
  readonly variante = input<StatCardVariante>('neutro');
}
