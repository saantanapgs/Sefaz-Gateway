import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../services/confirm';
import { NotificationService } from '../../services/notification';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { ToastContainerComponent } from '../../../shared/components/toast-container/toast-container';

/**
 * Desenha, uma única vez para o app inteiro, o diálogo de confirmação
 * (ConfirmService) e as mensagens rápidas (NotificationService).
 * Fica no componente raiz, ao lado do <router-outlet />.
 */
@Component({
  selector: 'app-overlays',
  standalone: true,
  imports: [ConfirmDialogComponent, ToastContainerComponent],
  templateUrl: './overlays.html',
})
export class OverlaysComponent {
  protected readonly confirm = inject(ConfirmService);
  protected readonly notificacoes = inject(NotificationService);
}
