import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { Gateway } from '../../models/gateway.model';
import { GatewayHealthStatus } from '../../models/gateway-health-status.model';
import { GatewayDetailsComponent } from './gateway-details';

const URL = `${environment.apiBaseUrl}/v1/gateways/1`;
const GATEWAY: Gateway = {
  id: 1, nome: 'Gateway A', ativo: true, contextPath: '/a', host: 'gw.local', porta: '8080', rateLimit: 100,
  urlExterna: 'https://ext.local', tags: ['interno'], backends: [{ id: 10, descricao: 'Pagamentos', status: 'UP', baseUrl: 'http://p' }],
};
const SAUDE: GatewayHealthStatus = {
  gatewayId: 1, nomeGateway: 'Gateway A', ativo: true, statusAgregado: 'DEGRADED', totalBackends: 1, totalUp: 0, totalDown: 0, totalUnknown: 0,
  backends: [{ backendId: 10, nome: 'Pagamentos', ultimoStatus: 'DOWN', dataUltimaVerificacao: '2026-01-01T10:00:00Z' }],
};

const aguardar = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('GatewayDetailsComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  async function criarCarregado() {
    const fixture = TestBed.createComponent(GatewayDetailsComponent);
    fixture.componentRef.setInput('gatewayId', 1);
    fixture.detectChanges();
    httpMock.expectOne(URL).flush(GATEWAY);
    httpMock.expectOne(`${URL}/versao`).flush({ gatewayId: 1, nomeGateway: 'Gateway A', versaoGitlab: 'v1.4.2' });
    httpMock.expectOne(`${URL}/endpoints/contagem`).flush({ gatewayId: 1, nomeGateway: 'Gateway A', totalBackends: 1, fonte: 'gitlab' });
    await aguardar(); // a saúde carrega em timer(0)
    httpMock.expectOne(`${URL}/status`).flush(SAUDE);
    fixture.detectChanges();
    return fixture;
  }

  it('mostra só o essencial e um cartão por assunto, sem carregar pipelines ainda', async () => {
    const fixture = await criarCarregado();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Gateway A');
    expect(el.textContent).toContain('v1.4.2');
    expect(el.querySelectorAll('.cartao').length).toBe(5);
    expect(el.querySelector('app-modal')).toBeNull();
    httpMock.expectNone(`${URL}/pipelines`);
  });

  it('abre cada seção em um modal próprio e fecha', async () => {
    const fixture = await criarCarregado();
    const el = fixture.nativeElement as HTMLElement;

    (el.querySelectorAll('.cartao')[3] as HTMLButtonElement).click(); // Configuração
    fixture.detectChanges();
    expect(fixture.componentInstance.secao()).toBe('configuracao');
    expect(el.querySelector('app-modal')?.textContent).toContain('Rate limit');

    fixture.componentInstance.fecharSecao();
    fixture.detectChanges();
    expect(el.querySelector('app-modal')).toBeNull();
  });

  it('só carrega os pipelines quando o modal de pipelines abre', async () => {
    const fixture = await criarCarregado();

    fixture.componentInstance.abrir('pipelines');
    fixture.detectChanges();

    httpMock.expectOne(`${URL}/pipelines`).flush([]);
    expect((fixture.nativeElement as HTMLElement).querySelector('app-gateway-pipelines')).toBeTruthy();
  });

  it('usa o status mais recente da saúde para cada backend', async () => {
    const tela = (await criarCarregado()).componentInstance;

    // o gateway veio com UP embutido, mas o painel de saúde diz DOWN
    expect(tela.statusDoBackend(GATEWAY.backends![0])).toBe('DOWN');
    expect(tela.statusDoBackend({ id: 99 })).toBe('UNKNOWN');
  });

  it('emite "editar" pelo botão do cabeçalho', async () => {
    const fixture = await criarCarregado();
    let editou = 0;
    fixture.componentInstance.editar.subscribe(() => editou++);

    ((fixture.nativeElement as HTMLElement).querySelector('.topo button') as HTMLButtonElement).click();

    expect(editou).toBe(1);
  });

  it('gateway inexistente mostra mensagem clara', async () => {
    const fixture = TestBed.createComponent(GatewayDetailsComponent);
    fixture.componentRef.setInput('gatewayId', 1);
    fixture.detectChanges();
    httpMock.expectOne(URL).flush('nao achou', { status: 404, statusText: 'Not Found' });
    httpMock.expectOne(`${URL}/versao`).flush('x', { status: 404, statusText: 'Not Found' });
    httpMock.expectOne(`${URL}/endpoints/contagem`).flush('x', { status: 404, statusText: 'Not Found' });
    await aguardar();
    httpMock.expectOne(`${URL}/status`).flush('x', { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(fixture.componentInstance.erro()).toContain('Gateway não encontrado');
    expect((fixture.nativeElement as HTMLElement).querySelector('app-error-state')).toBeTruthy();
  });
});
