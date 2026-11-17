import { TestBed } from '@angular/core/testing';
import { Gateway } from '../../models/gateway.model';
import { GatewayBackendsListComponent } from './gateway-backends-list';

const GATEWAYS: Gateway[] = [
  { id: 1, nome: 'A', ativo: true, contextPath: '/a', backends: [{ id: 10, descricao: 'Pagamentos', status: 'UP', baseUrl: 'http://p' }, { id: 11, status: 'DOWN' }] },
  { id: 2, nome: 'B', ativo: true, contextPath: '/b', backends: [{ id: 12 }] },
  { id: 3, nome: 'C', ativo: true, contextPath: '/c' },
];

function criar() {
  const fixture = TestBed.createComponent(GatewayBackendsListComponent);
  fixture.componentRef.setInput('gateways', GATEWAYS);
  fixture.detectChanges();
  return fixture;
}

describe('GatewayBackendsListComponent', () => {
  it('junta os backends de todos os gateways e trata "sem status" como UNKNOWN', () => {
    const tela = criar().componentInstance;

    expect(tela.itens().length).toBe(3);
    expect(tela.itens().map((i) => i.status)).toEqual(['UP', 'DOWN', 'UNKNOWN']);
  });

  it('filtra por status', () => {
    const fixture = criar();
    fixture.componentInstance.filtro.set('DOWN');
    fixture.detectChanges();

    expect(fixture.componentInstance.filtrados().map((i) => i.backend.id)).toEqual([11]);
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr').length).toBe(1);
  });

  it('mostra mensagem quando o filtro não encontra nada', () => {
    const fixture = criar();
    fixture.componentInstance.filtro.set('DEGRADED');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('app-empty-state')).toBeTruthy();
  });

  it('emite o gateway ao clicar no nome dele', () => {
    const fixture = criar();
    const abertos: number[] = [];
    fixture.componentInstance.abrirGateway.subscribe((g) => abertos.push(g.id));

    ((fixture.nativeElement as HTMLElement).querySelector('.gateway-link') as HTMLButtonElement).click();

    expect(abertos).toEqual([1]);
  });
});
