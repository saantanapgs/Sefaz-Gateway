import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { ConfirmService } from '../../../../core/services/confirm';
import { NotificationService } from '../../../../core/services/notification';
import { GitLabPipeline } from '../../../../shared/models/gitlab-pipeline.model';
import { GatewayBackendResumo } from '../../models/gateway.model';
import { PipelineTriggerComponent } from './pipeline-trigger';

const BACKENDS: GatewayBackendResumo[] = [{ id: 7, descricao: 'API Pagamentos' }, { id: 8, descricao: 'API Pedidos' }];
const URL = `${environment.apiBaseUrl}/v1/backends`;
const PIPELINE = { id: 1, iid: 12, projectId: 3, status: 'created', source: 'api', ref: 'develop', sha: 'abc', webUrl: '', createdAt: '', updatedAt: '' } as GitLabPipeline;

describe('PipelineTriggerComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function criar(backends = BACKENDS, refInicial?: string) {
    const fixture = TestBed.createComponent(PipelineTriggerComponent);
    fixture.componentRef.setInput('backends', backends);
    if (refInicial) fixture.componentRef.setInput('refInicial', refInicial);
    fixture.detectChanges();
    return fixture;
  }

  it('explica que não há onde disparar quando o gateway não tem backends', () => {
    const el = criar([]).nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nenhum backend vinculado');
    expect(el.querySelector('button')).toBeNull();
  });

  it('começa no primeiro backend e na branch inicial informada', () => {
    const tela = criar(BACKENDS, 'release').componentInstance;
    expect(tela.backendSelecionado()).toBe(7);
    expect(tela.ref()).toBe('release');
  });

  it('pede confirmação e só então dispara o POST com o backend e a branch escolhidos', async () => {
    const fixture = criar();
    const tela = fixture.componentInstance;
    const confirm = TestBed.inject(ConfirmService);
    let emitido: GitLabPipeline | undefined;
    tela.disparado.subscribe((p) => (emitido = p));

    tela.escolherBackend('8');
    tela.ref.set('develop');
    const acao = tela.disparar();
    expect(confirm.pendente()?.mensagem).toContain('API Pedidos');
    expect(confirm.pendente()?.mensagem).toContain('develop');
    httpMock.expectNone(`${URL}/8/runpipe?ref=develop`);

    confirm.responder(true);
    await acao;
    const req = httpMock.expectOne(`${URL}/8/runpipe?ref=develop`);
    expect(req.request.method).toBe('POST');
    req.flush(PIPELINE);

    expect(emitido?.iid).toBe(12);
    expect(tela.ultimo()?.backend).toBe('API Pedidos');
    expect(TestBed.inject(NotificationService).itens()[0].tipo).toBe('sucesso');
  });

  it('cancelar a confirmação não chama a API', async () => {
    const tela = criar().componentInstance;
    const confirm = TestBed.inject(ConfirmService);

    const acao = tela.disparar();
    confirm.responder(false);
    await acao;

    httpMock.expectNone(() => true);
  });

  it('avisa o erro e permite tentar de novo quando o disparo falha', async () => {
    const tela = criar().componentInstance;
    const confirm = TestBed.inject(ConfirmService);

    const acao = tela.disparar();
    confirm.responder(true);
    await acao;
    httpMock.expectOne(`${URL}/7/runpipe?ref=main`).flush('erro', { status: 500, statusText: 'Server Error' });

    expect(tela.disparando()).toBe(false);
    expect(TestBed.inject(NotificationService).itens()[0].tipo).toBe('erro');
  });
});
