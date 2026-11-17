import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CopyButtonComponent } from './copy-button';

describe('CopyButtonComponent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
  });

  function criar(texto = 'https://exemplo.local/api') {
    const fixture = TestBed.createComponent(CopyButtonComponent);
    fixture.componentRef.setInput('texto', texto);
    fixture.detectChanges();
    return fixture;
  }

  it('copia o texto e mostra a confirmação', async () => {
    const escrever = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: escrever }, configurable: true });
    const fixture = criar();

    await fixture.componentInstance.copiar();

    expect(escrever).toHaveBeenCalledWith('https://exemplo.local/api');
    expect(fixture.componentInstance.copiado()).toBe(true);
  });

  it('não mostra confirmação quando a cópia é negada', async () => {
    const escrever = vi.fn().mockRejectedValue(new Error('negado'));
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: escrever }, configurable: true });
    const fixture = criar();

    await fixture.componentInstance.copiar();

    expect(fixture.componentInstance.copiado()).toBe(false);
  });
});
