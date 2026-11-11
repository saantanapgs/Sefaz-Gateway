import { TestBed } from '@angular/core/testing';
import { ConfirmService } from './confirm';

describe('ConfirmService', () => {
  let service: ConfirmService;

  beforeEach(() => {
    service = TestBed.inject(ConfirmService);
  });

  it('abre a confirmação e resolve true quando o usuário confirma', async () => {
    const resposta = service.confirmar({ titulo: 'Excluir', mensagem: 'Tem certeza?' });
    expect(service.pendente()?.titulo).toBe('Excluir');

    service.responder(true);

    expect(await resposta).toBe(true);
    expect(service.pendente()).toBeNull();
  });

  it('resolve false quando o usuário cancela', async () => {
    const resposta = service.confirmar({ titulo: 'Excluir', mensagem: 'Tem certeza?' });
    service.responder(false);
    expect(await resposta).toBe(false);
  });

  it('cancela a confirmação anterior se abrir outra', async () => {
    const primeira = service.confirmar({ titulo: 'A', mensagem: 'a' });
    const segunda = service.confirmar({ titulo: 'B', mensagem: 'b' });

    expect(await primeira).toBe(false);
    expect(service.pendente()?.titulo).toBe('B');

    service.responder(true);
    expect(await segunda).toBe(true);
  });
});
