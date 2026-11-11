import { Injectable, signal } from '@angular/core';

export interface OpcoesConfirmacao {
  titulo: string;
  mensagem: string;
  rotuloConfirmar?: string;
  /** Destaca o botão de confirmar em vermelho (ações destrutivas). */
  perigo?: boolean;
}

interface ConfirmacaoPendente extends OpcoesConfirmacao {
  resolver: (confirmado: boolean) => void;
}

/**
 * Ponto único para pedir confirmação ao usuário antes de uma ação.
 *
 *   if (!(await this.confirm.confirmar({ titulo: '...', mensagem: '...' }))) return;
 *
 * O diálogo em si é desenhado uma vez só, no AppShellComponent.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly pendente = signal<ConfirmacaoPendente | null>(null);

  confirmar(opcoes: OpcoesConfirmacao): Promise<boolean> {
    // Se já existir uma confirmação aberta, ela é cancelada.
    this.pendente()?.resolver(false);
    return new Promise<boolean>((resolver) => this.pendente.set({ ...opcoes, resolver }));
  }

  responder(confirmado: boolean): void {
    const atual = this.pendente();
    if (!atual) return;
    this.pendente.set(null);
    atual.resolver(confirmado);
  }
}
