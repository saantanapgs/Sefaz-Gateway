import { TestBed } from '@angular/core/testing';
import { Gateway } from '../../models/gateway.model';
import { GatewayOverviewComponent } from './gateway-overview';

const GATEWAYS: Gateway[] = [
  { id: 1, nome: 'A', ativo: true, contextPath: '/a', backends: [{ id: 10, status: 'UP' }, { id: 11, status: 'UP' }] },
  { id: 2, nome: 'B', ativo: true, contextPath: '/b', backends: [{ id: 12, status: 'DOWN' }, { id: 13 }] },
  { id: 3, nome: 'C', ativo: false, contextPath: '/c', backends: [{ id: 14, status: 'DEGRADED' }] },
  { id: 4, nome: 'D', ativo: true, contextPath: '/d' },
];

function criar(gateways: Gateway[]) {
  const fixture = TestBed.createComponent(GatewayOverviewComponent);
  fixture.componentRef.setInput('gateways', gateways);
  fixture.detectChanges();
  return fixture;
}

describe('GatewayOverviewComponent', () => {
  it('calcula os indicadores a partir da lista (sem chamadas extras)', () => {
    const tela = criar(GATEWAYS).componentInstance;

    expect(tela.total()).toBe(4);
    expect(tela.ativos()).toBe(3);
    expect(tela.inativos()).toBe(1);
    // só gateway ATIVO com backend DOWN/DEGRADED conta (o C está inativo)
    expect(tela.comProblemas()).toBe(1);
  });

  it('distribui o status de todos os backends, contando "sem status" como UNKNOWN', () => {
    const tela = criar(GATEWAYS).componentInstance;
    const porStatus = Object.fromEntries(tela.distribuicao().map((d) => [d.status, d.quantidade]));

    expect(tela.totalBackends()).toBe(5);
    expect(porStatus).toEqual({ UP: 2, DEGRADED: 1, DOWN: 1, UNKNOWN: 1 });
    expect(tela.distribuicao().reduce((soma, d) => soma + d.percentual, 0)).toBeCloseTo(100);
  });

  it('lista em "requer atenção" só os gateways ativos com problema', () => {
    const fixture = criar(GATEWAYS);
    const nomes = fixture.componentInstance.atencao().map((a) => a.gateway.nome);

    expect(nomes).toEqual(['B']);
    expect((fixture.nativeElement as HTMLElement).querySelector('.atencao__linha')).toBeTruthy();
  });

  it('avisa que está tudo bem quando não há problemas e desabilita "Ver backends" sem backends', () => {
    const fixture = criar([{ id: 1, nome: 'A', ativo: true, contextPath: '/a' }]);
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.ok')?.textContent).toContain('Nenhum gateway ativo');
    expect(el.querySelector('.vazio')).toBeTruthy();
    expect((el.querySelector('.cartao__topo button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('emite o gateway ao clicar em "requer atenção" e o evento de ver backends', () => {
    const fixture = criar(GATEWAYS);
    const el = fixture.nativeElement as HTMLElement;
    const abertos: number[] = [];
    let verBackends = 0;
    fixture.componentInstance.detalhes.subscribe((g) => abertos.push(g.id));
    fixture.componentInstance.verBackends.subscribe(() => verBackends++);

    (el.querySelector('.atencao__linha') as HTMLButtonElement).click();
    (el.querySelector('.cartao__topo button') as HTMLButtonElement).click();

    expect(abertos).toEqual([2]);
    expect(verBackends).toBe(1);
  });

  it('mostra no máximo 5 gateways em atenção e informa quantos ficaram de fora', () => {
    const muitos: Gateway[] = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1, nome: `G${i + 1}`, ativo: true, contextPath: '/x', backends: [{ id: i + 100, status: 'DOWN' as const }],
    }));
    const tela = criar(muitos).componentInstance;

    expect(tela.atencao().length).toBe(5);
    expect(tela.atencaoExtras()).toBe(2);
  });
});
