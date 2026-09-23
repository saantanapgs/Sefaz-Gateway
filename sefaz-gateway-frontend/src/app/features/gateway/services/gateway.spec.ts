import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GatewayService } from './gateway';
import { environment } from '../../../../environments/environment';
import { Gateway, GatewayCreate, GatewayUpdate } from '../models/gateway.model';

describe('GatewayService', () => {
  let service: GatewayService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/v1/gateways`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GatewayService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GatewayService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lista gateways via GET /v1/gateways', () => {
    const mock: Gateway[] = [{ id: 1, nome: 'Gw1', ativo: true, contextPath: '/gw1', backends: [] }];

    service.listar().subscribe((res) => expect(res).toEqual(mock));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('busca gateway por id via GET /v1/gateways/{id}', () => {
    const mock: Gateway = { id: 1, nome: 'Gw1', ativo: true, contextPath: '/gw1', backends: [] };

    service.buscar(1).subscribe((res) => expect(res).toEqual(mock));

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('cria gateway via POST /v1/gateways', () => {
    const dto: GatewayCreate = { nome: 'Novo', contextPath: '/novo', backendIds: [1] };
    const mock: Gateway = { id: 2, nome: 'Novo', ativo: true, contextPath: '/novo', backends: [] };

    service.criar(dto).subscribe((res) => expect(res).toEqual(mock));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mock);
  });

  it('atualiza gateway via PUT /v1/gateways/{id}', () => {
    const dto: GatewayUpdate = { nome: 'Atualizado' };
    const mock: Gateway = { id: 1, nome: 'Atualizado', ativo: true, contextPath: '/gw1', backends: [] };

    service.atualizar(1, dto).subscribe((res) => expect(res).toEqual(mock));

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mock);
  });

  it('exclui gateway via DELETE /v1/gateways/{id}', () => {
    service.deletar(1).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('ativa gateway via PATCH /v1/gateways/{id}/ativar', () => {
    const mock: Gateway = { id: 1, nome: 'Gw1', ativo: true, contextPath: '/gw1', backends: [] };

    service.ativar(1).subscribe((res) => expect(res).toEqual(mock));

    const req = httpMock.expectOne(`${baseUrl}/1/ativar`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mock);
  });

  it('desativa gateway via PATCH /v1/gateways/{id}/desativar', () => {
    const mock: Gateway = { id: 1, nome: 'Gw1', ativo: false, contextPath: '/gw1', backends: [] };

    service.desativar(1).subscribe((res) => expect(res).toEqual(mock));

    const req = httpMock.expectOne(`${baseUrl}/1/desativar`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mock);
  });
});
