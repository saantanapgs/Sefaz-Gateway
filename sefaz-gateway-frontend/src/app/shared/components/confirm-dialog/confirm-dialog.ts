import { Component, input, output } from '@angular/core';

/**
 * Diálogo de confirmação reutilizável para ações destrutivas
 * (excluir, desativar, etc.). Não decide nada sozinho — só emite
 * o evento e quem o usa decide o que fazer.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialogComponent {
  readonly titulo = input.required<string>();
  readonly mensagem = input.required<string>();
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}
