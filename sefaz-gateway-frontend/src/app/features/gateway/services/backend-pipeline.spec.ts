import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { GitLabPipeline } from '../../../shared/models/gitlab-pipeline.model';
import { BackendPipelineService } from './backend-pipeline';

describe('BackendPipelineService', () => {
  let service: BackendPipelineService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/v1/backends`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(BackendPipelineService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('dispara o pipeline via POST /v1/backends/{id}/runpipe com a ref informada', () => {
    const pipeline = { id: 1, iid: 7, projectId: 3, status: 'created', source: 'api', ref: 'develop', sha: 'abc', webUrl: '', createdAt: '', updatedAt: '' } as GitLabPipeline;

    service.executar(5, 'develop').subscribe((res) => expect(res).toEqual(pipeline));

    const req = httpMock.expectOne(`${baseUrl}/5/runpipe?ref=develop`);
    expect(req.request.method).toBe('POST');
    req.flush(pipeline);
  });

  it('usa a branch "main" quando nenhuma ref é informada', () => {
    service.executar(5).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/5/runpipe?ref=main`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
