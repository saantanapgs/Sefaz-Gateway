import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { GitLabPipeline } from '../../../../shared/models/gitlab-pipeline.model';
import { GatewayPipelinesComponent } from './gateway-pipelines';

const URL = `${environment.apiBaseUrl}/v1/gateways/1/pipelines`;
const LISTA = [
  { id: 1, iid: 10, projectId: 9, status: 'success', source: 'push', ref: 'main', sha: 'aaa', webUrl: '', createdAt: '', updatedAt: '' },
  { id: 2, iid: 11, projectId: 9, status: 'failed', source: 'push', ref: 'develop', sha: 'bbb', webUrl: '', createdAt: '', updatedAt: '' },
] as GitLabPipeline[];

describe('GatewayPipelinesComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function criar() {
    const fixture = TestBed.createComponent(GatewayPipelinesComponent);
    fixture.componentRef.setInput('gatewayId', 1);
    fixture.componentRef.setInput('backends', [{ id: 5, descricao: 'API X' }]);
    fixture.detectChanges(); // ngOnInit -> GET
    return fixture;
  }

  it('carrega a lista ao abrir e mostra um item por pipeline', () => {
    const fixture = criar();
    httpMock.expectOne(URL).flush(LISTA);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.linha').length).toBe(2);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('2 pipeline(s)');
  });

  it('abre o modal de detalhes ao clicar num pipeline', () => {
    const fixture = criar();
    httpMock.expectOne(URL).flush(LISTA);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    (el.querySelectorAll('.linha')[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selecionado()?.iid).toBe(11);
    expect(el.querySelector('app-modal app-pipeline-details')).toBeTruthy();
  });

  it('lista vazia mostra estado vazio e o botão de disparar novo abre o modal de disparo', () => {
    const fixture = criar();
    httpMock.expectOne(URL).flush([]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('app-empty-state')).toBeTruthy();

    (el.querySelectorAll('.barra__acoes button')[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('app-modal app-pipeline-trigger')).toBeTruthy();
  });

  it('mostra o erro com "tentar novamente", que refaz a chamada', () => {
    const fixture = criar();
    httpMock.expectOne(URL).flush('erro', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.erro()).toContain('Erro no servidor');

    fixture.componentInstance.carregar();
    httpMock.expectOne(URL).flush(LISTA);
    expect(fixture.componentInstance.pipelines()?.length).toBe(2);
  });
});
