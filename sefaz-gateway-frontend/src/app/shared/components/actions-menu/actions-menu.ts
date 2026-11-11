import { Component, ElementRef, HostListener, inject, input, output, signal, viewChild } from '@angular/core';
import { IconComponent, NomeIcone } from '../icon/icon';

export interface ItemMenu {
  id: string;
  rotulo: string;
  icone?: NomeIcone;
  perigo?: boolean;
  desabilitado?: boolean;
}

interface PosicaoMenu {
  top: number | null;
  bottom: number | null;
  right: number;
}

const ALTURA_ITEM_PX = 38;

/**
 * Menu de "três pontos". Recebe a lista de itens e emite o `id` do item
 * escolhido — não sabe o que cada ação faz. O painel usa position: fixed
 * para não ser cortado pelo scroll horizontal da tabela.
 */
@Component({
  selector: 'app-actions-menu',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './actions-menu.html',
  styleUrl: './actions-menu.css',
})
export class ActionsMenuComponent {
  readonly itens = input.required<ItemMenu[]>();
  readonly rotulo = input('Exibir ações');
  readonly selecionar = output<string>();

  readonly aberto = signal(false);
  readonly posicao = signal<PosicaoMenu>({ top: 0, bottom: null, right: 0 });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly botao = viewChild.required<ElementRef<HTMLButtonElement>>('botao');

  alternar(): void {
    if (this.aberto()) {
      this.fechar();
    } else {
      this.abrir();
    }
  }

  escolher(item: ItemMenu): void {
    if (item.desabilitado) return;
    this.fechar();
    this.selecionar.emit(item.id);
  }

  @HostListener('document:click', ['$event'])
  aoClicarNoDocumento(evento: MouseEvent): void {
    if (this.aberto() && !this.host.nativeElement.contains(evento.target as Node)) {
      this.aberto.set(false);
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  aoRolarOuRedimensionar(): void {
    if (this.aberto()) this.aberto.set(false);
  }

  @HostListener('keydown.escape')
  aoApertarEsc(): void {
    if (this.aberto()) this.fechar(true);
  }

  private abrir(): void {
    const area = this.botao().nativeElement.getBoundingClientRect();
    const alturaEstimada = this.itens().length * ALTURA_ITEM_PX + 12;
    const cabeParaBaixo = area.bottom + alturaEstimada + 8 < window.innerHeight;
    const direita = Math.max(window.innerWidth - area.right, 8);

    this.posicao.set(
      cabeParaBaixo
        ? { top: area.bottom + 4, bottom: null, right: direita }
        : { top: null, bottom: window.innerHeight - area.top + 4, right: direita }
    );
    this.aberto.set(true);
  }

  private fechar(devolverFoco = false): void {
    this.aberto.set(false);
    if (devolverFoco) this.botao().nativeElement.focus();
  }
}
