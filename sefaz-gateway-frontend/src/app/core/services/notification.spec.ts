import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notification';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adiciona mensagens com o tipo correto', () => {
    service.sucesso('Salvo');
    service.erro('Falhou');

    expect(service.itens().map((n) => n.tipo)).toEqual(['sucesso', 'erro']);
  });

  it('remove a mensagem sozinha depois de alguns segundos', () => {
    service.sucesso('Salvo');
    expect(service.itens().length).toBe(1);

    vi.advanceTimersByTime(5000);

    expect(service.itens().length).toBe(0);
  });

  it('remove a mensagem ao fechar manualmente', () => {
    service.info('Olá');
    const [{ id }] = service.itens();

    service.fechar(id);

    expect(service.itens().length).toBe(0);
  });
});
