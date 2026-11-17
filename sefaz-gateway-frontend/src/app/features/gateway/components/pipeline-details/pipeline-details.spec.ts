import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { GitLabPipeline } from '../../../../shared/models/gitlab-pipeline.model';
import { PipelineDetailsComponent } from './pipeline-details';

const URL = `${environment.apiBaseUrl}/v1/gateways`;
const PIPELINE = { id: 7, iid: 3, projectId: 9, status: 'running', source: 'push', ref: 'main', sha: '0123456789abcdef', name: 'Build', webUrl: 'https://gitlab.local/p/3', createdAt: '2026-01-01T10:00:00Z', updatedAt: '2026-01-01T10:05:00Z' } as GitLabPipeline;

describe('PipelineDetailsComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function criar() {
    const fixture = TestBed.createComponent(PipelineDetailsComponent);
    fixture.componentRef.setInput('gatewayId', 1);
    fixture.componentRef.setInput('pipeline', PIPELINE);
    fixture.componentRef.setInput('backends', [{ id: 5, descricao: 'API X' }]);
    fixture.detectChanges();
    return fixture;
  }

  it('mostra os campos do pipeline e o disparo com a branch dele preenchida', () => {
    const el = criar().nativeElement as HTMLElement;

    expect(el.textContent).toContain('Pipeline #3');
    expect(el.textContent).toContain('0123456789');
    expect(el.textContent).toContain('Build');
    expect(el.querySelector('app-pipeline-trigger')).toBeTruthy();
    expect((el.querySelector('app-pipeline-trigger input') as HTMLInputElement).value).toBe('main');
  });

  it('atualiza o status consultando GET .../pipeline/status?pipelineId=', () => {
    const fixture = criar();

    fixture.componentInstance.atualizarStatus();
    const req = httpMock.expectOne(`${URL}/1/pipeline/status?pipelineId=7`);
    expect(req.request.method).toBe('GET');
    req.flush({ ...PIPELINE, status: 'success' });
    fixture.detectChanges();

    expect(fixture.componentInstance.atual().status).toBe('success');
    expect(fixture.componentInstance.atualizadoEm()).not.toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('.pipeline--ok')).toBeTruthy();
  });

  it('mostra o erro e mantém o status anterior quando a atualização falha', () => {
    const fixture = criar();

    fixture.componentInstance.atualizarStatus();
    httpMock.expectOne(`${URL}/1/pipeline/status?pipelineId=7`).flush('erro', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.erro()).toContain('Erro no servidor');
    expect(fixture.componentInstance.atual().status).toBe('running');
  });
});
