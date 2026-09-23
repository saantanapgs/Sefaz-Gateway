import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Gateway, GatewayCreate, GatewayUpdate } from '../models/gateway.model';
import { GatewayHealthStatus } from '../models/gateway-health-status.model';
import { GatewayVersion } from '../models/gateway-version.model';
import { GatewayEndpointCount } from '../models/gateway-endpoint-count.model';
import { GitLabPipeline } from '../../../shared/models/gitlab-pipeline.model';

/**
 * Único responsável por conversar com /v1/gateways.
 * Nenhum componente deve chamar HttpClient diretamente — sempre passar por aqui.
 */
@Injectable({ providedIn: 'root' })
export class GatewayService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/gateways`;

  listar(): Observable<Gateway[]> {
    return this.http.get<Gateway[]>(this.baseUrl);
  }

  buscar(id: number): Observable<Gateway> {
    return this.http.get<Gateway>(`${this.baseUrl}/${id}`);
  }

  criar(dto: GatewayCreate): Observable<Gateway> {
    return this.http.post<Gateway>(this.baseUrl, dto);
  }

  atualizar(id: number, dto: GatewayUpdate): Observable<Gateway> {
    return this.http.put<Gateway>(`${this.baseUrl}/${id}`, dto);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  ativar(id: number): Observable<Gateway> {
    return this.http.patch<Gateway>(`${this.baseUrl}/${id}/ativar`, {});
  }

  desativar(id: number): Observable<Gateway> {
    return this.http.patch<Gateway>(`${this.baseUrl}/${id}/desativar`, {});
  }

  versao(id: number): Observable<GatewayVersion> {
    return this.http.get<GatewayVersion>(`${this.baseUrl}/${id}/versao`);
  }

  status(id: number): Observable<GatewayHealthStatus> {
    return this.http.get<GatewayHealthStatus>(`${this.baseUrl}/${id}/status`);
  }

  pipelines(id: number): Observable<GitLabPipeline[]> {
    return this.http.get<GitLabPipeline[]>(`${this.baseUrl}/${id}/pipelines`);
  }

  statusPipeline(id: number, pipelineId?: number | null): Observable<GitLabPipeline> {
    let params = new HttpParams();
    if (pipelineId != null) {
      params = params.set('pipelineId', pipelineId);
    }
    return this.http.get<GitLabPipeline>(`${this.baseUrl}/${id}/pipeline/status`, { params });
  }

  contagemEndpoints(id: number): Observable<GatewayEndpointCount> {
    return this.http.get<GatewayEndpointCount>(`${this.baseUrl}/${id}/endpoints/contagem`);
  }
}
