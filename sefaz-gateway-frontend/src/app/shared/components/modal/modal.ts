import { Component, DestroyRef, ElementRef, afterNextRender, inject, input, output, viewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { IconComponent } from '../icon/icon';

// Vários modais podem estar empilhados (ex.: detalhes > pipelines > pipeline).
// O scroll da página só volta ao normal quando o último fecha.
let modaisAbertos = 0;
let overflowOriginal = '';

/**
 * Janela modal genérica: título + botão de fechar + conteúdo projetado
 * (<ng-content>). Fecha com Esc e pelo X; o clique fora só fecha se
 * `fecharAoClicarFora` for true. O Esc fecha apenas o modal de cima, e o
 * foco volta para onde estava quando o modal fecha.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class ModalComponent {
  readonly titulo = input.required<string>();
  readonly largura = input<'sm' | 'md' | 'lg'>('md');
  readonly fecharAoClicarFora = input(false);
  readonly fechar = output<void>();

  private readonly painel = viewChild.required<ElementRef<HTMLElement>>('painel');

  constructor() {
    const documento = inject(DOCUMENT);
    const focoAnterior = documento.activeElement as HTMLElement | null;

    if (modaisAbertos++ === 0) {
      overflowOriginal = documento.body.style.overflow;
      documento.body.style.overflow = 'hidden';
    }

    inject(DestroyRef).onDestroy(() => {
      if (--modaisAbertos === 0) documento.body.style.overflow = overflowOriginal;
      focoAnterior?.focus?.();
    });

    afterNextRender(() => this.painel().nativeElement.focus());
  }

  aoClicarFora(): void {
    if (this.fecharAoClicarFora()) this.fechar.emit();
  }

  aoApertarEsc(evento: Event): void {
    evento.stopPropagation();
    this.fechar.emit();
  }
}
