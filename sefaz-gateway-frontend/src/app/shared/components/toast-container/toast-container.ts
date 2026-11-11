import { Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon';

export interface ToastItem {
  id: number;
  tipo: 'sucesso' | 'erro' | 'info';
  mensagem: string;
}

/** Lista de mensagens rápidas. Só desenha; quem alimenta é o NotificationService. */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
})
export class ToastContainerComponent {
  readonly itens = input.required<ToastItem[]>();
  readonly fechar = output<number>();
}
