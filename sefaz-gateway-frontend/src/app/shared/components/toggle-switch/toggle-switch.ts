import { Component, input, output } from '@angular/core';

/**
 * Interruptor liga/desliga. É "burro" de propósito: não muda de estado
 * sozinho, só avisa (`alternar`) que o usuário clicou. Quem usa decide se
 * muda de fato (por exemplo, só depois de confirmar e a API responder OK).
 */
@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  templateUrl: './toggle-switch.html',
  styleUrl: './toggle-switch.css',
})
export class ToggleSwitchComponent {
  readonly ativo = input.required<boolean>();
  readonly rotulo = input.required<string>();
  readonly desabilitado = input(false);
  readonly alternar = output<void>();
}
