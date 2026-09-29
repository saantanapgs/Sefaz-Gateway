import { Component, input, output } from '@angular/core';

/**
 * Mensagem de erro reutilizável, com opção de botão "tentar novamente".
 * Usada sempre que uma chamada HTTP falha, em qualquer feature.
 */
@Component({
  selector: 'app-error-state',
  standalone: true,
  templateUrl: './error-state.html',
  styleUrl: './error-state.scss',
})
export class ErrorStateComponent {
  readonly mensagem = input.required<string>();
  readonly tentarNovamente = output<void>();
}
