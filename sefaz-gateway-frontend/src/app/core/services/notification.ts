import { Injectable, signal } from '@angular/core';

export type TipoNotificacao = 'sucesso' | 'erro' | 'info';

export interface Notificacao {
  id: number;
  tipo: TipoNotificacao;
  mensagem: string;
}

const DURACAO_MS = 4500;

/** Mensagens rápidas ("toasts") de sucesso/erro. Exibidas pelo AppShellComponent. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly itens = signal<Notificacao[]>([]);
  private proximoId = 1;

  sucesso(mensagem: string): void {
    this.adicionar('sucesso', mensagem);
  }

  erro(mensagem: string): void {
    this.adicionar('erro', mensagem);
  }

  info(mensagem: string): void {
    this.adicionar('info', mensagem);
  }

  fechar(id: number): void {
    this.itens.update((lista) => lista.filter((n) => n.id !== id));
  }

  private adicionar(tipo: TipoNotificacao, mensagem: string): void {
    const id = this.proximoId++;
    this.itens.update((lista) => [...lista, { id, tipo, mensagem }]);
    setTimeout(() => this.fechar(id), DURACAO_MS);
  }
}
