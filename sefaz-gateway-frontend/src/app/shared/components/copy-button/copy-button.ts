import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { IconComponent } from '../icon/icon';

/**
 * Botão que copia um texto (URL, host, SHA...) para a área de transferência.
 * Mostra um "check" por um instante como confirmação. Em páginas servidas por
 * HTTP (sem contexto seguro) a Clipboard API não existe, então usa um
 * fallback com textarea temporário.
 */
@Component({
  selector: 'app-copy-button',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './copy-button.html',
  styleUrl: './copy-button.css',
})
export class CopyButtonComponent {
  readonly texto = input.required<string>();
  readonly rotulo = input('Copiar');
  readonly copiado = signal(false);

  private temporizador?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
  }

  async copiar(): Promise<void> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(this.texto());
      } else {
        this.copiarComFallback(this.texto());
      }
    } catch {
      return; // sem permissão para copiar: não mostra confirmação
    }
    this.copiado.set(true);
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.copiado.set(false), 1500);
  }

  private copiarComFallback(texto: string): void {
    const campo = document.createElement('textarea');
    campo.value = texto;
    campo.style.position = 'fixed';
    campo.style.opacity = '0';
    document.body.appendChild(campo);
    campo.select();
    const copiou = document.execCommand('copy');
    document.body.removeChild(campo);
    if (!copiou) throw new Error('Não foi possível copiar');
  }
}
