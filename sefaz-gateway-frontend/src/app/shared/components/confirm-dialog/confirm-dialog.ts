import { Component, ElementRef, afterNextRender, input, output, viewChild } from '@angular/core';

/**
 * Diálogo de confirmação. Não decide nada: emite `confirmar` ou `cancelar`.
 * Normalmente é usado via ConfirmService (desenhado uma vez no AppShell).
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialogComponent {
  readonly titulo = input.required<string>();
  readonly mensagem = input.required<string>();
  readonly rotuloConfirmar = input('Confirmar');
  readonly perigo = input(false);
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  private readonly painel = viewChild.required<ElementRef<HTMLElement>>('painel');

  constructor() {
    afterNextRender(() => this.painel().nativeElement.focus());
  }
}
