import { Component, DestroyRef, ElementRef, afterNextRender, inject, input, output, viewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { IconComponent } from '../icon/icon';

/**
 * Janela modal genérica: título + botão de fechar + conteúdo projetado
 * (<ng-content>). Fecha com Esc e pelo X; o clique fora só fecha se
 * `fecharAoClicarFora` for true (desligado por padrão para não perder o
 * que foi digitado num formulário).
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
  readonly largura = input<'md' | 'lg'>('md');
  readonly fecharAoClicarFora = input(false);
  readonly fechar = output<void>();

  private readonly painel = viewChild.required<ElementRef<HTMLElement>>('painel');

  constructor() {
    const documento = inject(DOCUMENT);
    const anterior = documento.body.style.overflow;
    documento.body.style.overflow = 'hidden';
    inject(DestroyRef).onDestroy(() => {
      documento.body.style.overflow = anterior;
    });

    afterNextRender(() => this.painel().nativeElement.focus());
  }

  aoClicarFora(): void {
    if (this.fecharAoClicarFora()) this.fechar.emit();
  }
}
