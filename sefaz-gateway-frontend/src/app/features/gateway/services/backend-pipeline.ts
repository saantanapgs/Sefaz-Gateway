import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GitLabPipeline } from '../../../shared/models/gitlab-pipeline.model';

/**
 * Dispara um pipeline de um Backend no GitLab.
 *
 * ATENÇÃO: o Swagger não tem endpoint para disparar pipeline de Gateway.
 * O único endpoint de disparo é POST /v1/backends/{id}/runpipe (query `ref`,
 * padrão "main"), que pertence ao recurso Backend. Por isso este service é
 * separado do GatewayService: quando existir uma feature de Backend completa,
 * este método deve migrar para o BackendService.
 *
 * O Swagger também tem a rota duplicada no singular (/v1/backend/{id}/runpipe);
 * aqui usamos a do plural, igual ao padrão de Gateway.
 */
@Injectable({ providedIn: 'root' })
export class BackendPipelineService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/backends`;

  executar(backendId: number, ref = 'main'): Observable<GitLabPipeline> {
    const params = new HttpParams().set('ref', ref);
    return this.http.post<GitLabPipeline>(`${this.baseUrl}/${backendId}/runpipe`, null, { params });
  }
}
