import { TestBed } from '@angular/core/testing';
import { Gateway } from '../../models/gateway.model';
import { GatewayTableComponent, LinhaGateway } from './gateway-table';

const GATEWAY: Gateway = {
  id: 1, nome: 'Gateway A', ativo: true, contextPath: '/a', host: 'gw.local', porta: '8080', enderecoIp: '10.0.0.1',
  urlExterna: 'https://ext.local', rateLimit: 500, tentativasRetentativa: 3, gitlabId: 42, tags: ['interno'],
  backends: [{ id: 10, status: 'UP' }],
};

const LINHA: LinhaGateway = {
  gateway: GATEWAY, totalBackends: 1, backendsVisiveis: GATEWAY.backends!, backendsExtras: 0,
  menu: [{ id: 'editar', rotulo: 'Editar' }],
};

function criar() {
  const fixture = TestBed.createComponent(GatewayTableComponent);
  fixture.componentRef.setInput('linhas', [LINHA]);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const cabecalhos = () => Array.from(el.querySelectorAll('thead th')).map((th) => th.textContent!.trim());
  const abrirVisao = (indice: number) => {
    (el.querySelectorAll('.visoes__aba')[indice] as HTMLButtonElement).click();
    fixture.detectChanges();
  };
  return { fixture, el, cabecalhos, abrirVisao };
}

describe('GatewayTableComponent', () => {
  it('começa na visão Resumo, com toggle de situação', () => {
    const { cabecalhos, el } = criar();
    expect(cabecalhos()).toEqual(['Gateway', 'Host', 'Backends', 'Situação', 'Ações']);
    expect(el.querySelector('app-toggle-switch')).toBeTruthy();
  });

  it('troca as colunas ao mudar de visão, sem mexer nos dados', () => {
    const { cabecalhos, abrirVisao, el } = criar();

    abrirVisao(1);
    expect(cabecalhos()).toEqual(['Gateway', 'Host', 'IP', 'URL externa', 'URL interna', 'Métricas', 'Ações']);
    expect(el.textContent).toContain('10.0.0.1');
    expect(el.textContent).toContain('https://ext.local');

    abrirVisao(2);
    expect(cabecalhos()).toEqual(['Gateway', 'Rate limit', 'Retentativas', 'GitLab ID', 'Situação', 'Ações']);
    expect(el.textContent).toContain('500');
    expect(el.textContent).toContain('42');
  });

  it('na visão de rede, URL preenchida tem botão de copiar e URL vazia mostra traço', () => {
    const { abrirVisao, el } = criar();
    abrirVisao(1);

    // só a URL externa está preenchida: 1 botão de copiar
    expect(el.querySelectorAll('app-copy-button').length).toBe(1);
    expect(el.querySelectorAll('.sem-dado').length).toBe(2);
  });

  it('emite detalhes, ação do menu e alternar', () => {
    const { fixture, el } = criar();
    const detalhes: number[] = [];
    const acoes: string[] = [];
    const alternados: number[] = [];
    fixture.componentInstance.detalhes.subscribe((g) => detalhes.push(g.id));
    fixture.componentInstance.acao.subscribe((a) => acoes.push(a.acao));
    fixture.componentInstance.alternar.subscribe((g) => alternados.push(g.id));

    (el.querySelector('.nome-link') as HTMLButtonElement).click();
    (el.querySelector('app-toggle-switch button') as HTMLButtonElement).click();
    (el.querySelector('.gatilho') as HTMLButtonElement).click();
    fixture.detectChanges();
    (el.querySelector('[role="menuitem"]') as HTMLButtonElement).click();

    expect(detalhes).toEqual([1]);
    expect(alternados).toEqual([1]);
    expect(acoes).toEqual(['editar']);
  });

  it('desabilita o toggle da linha enquanto há ação em andamento', () => {
    const { fixture, el } = criar();
    fixture.componentRef.setInput('emAndamento', [1]);
    fixture.detectChanges();

    expect((el.querySelector('app-toggle-switch button') as HTMLButtonElement).disabled).toBe(true);
  });
});
