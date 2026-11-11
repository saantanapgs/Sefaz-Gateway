import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { ConfirmService } from '../../../../core/services/confirm';
import { NotificationService } from '../../../../core/services/notification';
import { Gateway } from '../../models/gateway.model';
import { GatewayDashboardComponent } from './gateway-dashboard';

const URL = `${environment.apiBaseUrl}/v1/gateways`;

const GATEWAYS: Gateway[] = [
  { id: 1, nome: 'Gateway A', ativo: true, contextPath: '/a', backends: [{ id: 10, status: 'UP' }] },
  { id: 2, nome: 'Gateway B', ativo: true, contextPath: '/b', backends: [{ id: 11, status: 'DOWN' }] },
  { id: 3, nome: 'Gateway C', ativo: false, contextPath: '/c', backends: [{ id: 12, status: 'DEGRADED' }] },
];

const aguardar = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('GatewayDashboardComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  async function criarCarregado() {
    const fixture = TestBed.createComponent(GatewayDashboardComponent);
    fixture.detectChanges();
    await aguardar(); // a primeira atualização dispara em timer(0)
    httpMock.expectOne(URL).flush(GATEWAYS);
    fixture.detectChanges();
    return fixture;
  }

  it('calcula os indicadores a partir de GET /v1/gateways', async () => {
    const { componentInstance: tela } = await criarCarregado();

    expect(tela.carregando()).toBe(false);
    expect(tela.total()).toBe(3);
    expect(tela.ativos()).toBe(2);
    expect(tela.inativos()).toBe(1);
    // só conta gateway ATIVO com backend DOWN/DEGRADED (o C está inativo)
    expect(tela.comProblemas()).toBe(1);
  });

  it('mostra erro claro quando a primeira carga falha', async () => {
    const fixture = TestBed.createComponent(GatewayDashboardComponent);
    fixture.detectChanges();
    await aguardar();
    httpMock.expectOne(URL).flush('erro', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.erro()).toContain('Erro no servidor');
    expect(fixture.nativeElement.querySelector('app-error-state')).toBeTruthy();
  });

  it('filtra por busca e por situação sem nova chamada HTTP', async () => {
    const { componentInstance: tela } = await criarCarregado();

    tela.termoBusca.set('gateway b');
    expect(tela.linhas().map((l) => l.gateway.id)).toEqual([2]);

    tela.termoBusca.set('');
    tela.filtroStatus.set('inativos');
    expect(tela.linhas().map((l) => l.gateway.id)).toEqual([3]);
  });

  it('desativar pede confirmação e só chama PATCH depois de confirmar', async () => {
    const { componentInstance: tela } = await criarCarregado();
    const confirm = TestBed.inject(ConfirmService);

    const acao = tela.alternarAtivo(GATEWAYS[0]);
    expect(confirm.pendente()?.titulo).toBe('Desativar gateway');
    httpMock.expectNone(`${URL}/1/desativar`);

    confirm.responder(true);
    await acao;

    const req = httpMock.expectOne(`${URL}/1/desativar`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...GATEWAYS[0], ativo: false });

    expect(tela.gateways().find((g) => g.id === 1)?.ativo).toBe(false);
    expect(TestBed.inject(NotificationService).itens()[0].tipo).toBe('sucesso');
  });

  it('cancelar a confirmação não chama a API', async () => {
    const { componentInstance: tela } = await criarCarregado();
    const confirm = TestBed.inject(ConfirmService);

    const acao = tela.alternarAtivo(GATEWAYS[0]);
    confirm.responder(false);
    await acao;

    httpMock.expectNone(`${URL}/1/desativar`);
    expect(tela.gateways().find((g) => g.id === 1)?.ativo).toBe(true);
  });

  it('excluir pede confirmação e remove da lista depois de confirmar', async () => {
    const { componentInstance: tela } = await criarCarregado();
    const confirm = TestBed.inject(ConfirmService);

    const acao = tela.excluir(GATEWAYS[1]);
    expect(confirm.pendente()?.perigo).toBe(true);
    confirm.responder(true);
    await acao;

    const req = httpMock.expectOne(`${URL}/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(tela.gateways().map((g) => g.id)).toEqual([1, 3]);
  });

  it('falha ao excluir mantém o gateway na lista e avisa o erro', async () => {
    const { componentInstance: tela } = await criarCarregado();
    const confirm = TestBed.inject(ConfirmService);

    const acao = tela.excluir(GATEWAYS[1]);
    confirm.responder(true);
    await acao;
    httpMock.expectOne(`${URL}/2`).flush('erro', { status: 500, statusText: 'Server Error' });

    expect(tela.gateways().length).toBe(3);
    expect(TestBed.inject(NotificationService).itens()[0].tipo).toBe('erro');
  });

  it('abre os modais de criar, detalhes e edição, um por vez', async () => {
    const { componentInstance: tela } = await criarCarregado();

    tela.abrirCriar();
    expect(tela.criando()).toBe(true);

    tela.abrirDetalhes(GATEWAYS[0]);
    expect(tela.criando()).toBe(false);
    expect(tela.gatewayDetalhando()?.id).toBe(1);

    tela.abrirEdicao(GATEWAYS[0]);
    expect(tela.gatewayDetalhando()).toBeNull();
    expect(tela.gatewayEditando()?.id).toBe(1);

    tela.fecharModais();
    expect(tela.gatewayEditando()).toBeNull();
  });
});
