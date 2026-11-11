import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { ConfirmService } from '../../../../core/services/confirm';
import { Gateway } from '../../models/gateway.model';
import { GatewayFormComponent } from './gateway-form';

const URL = `${environment.apiBaseUrl}/v1/gateways`;
const EXISTENTE: Gateway = { id: 4, nome: 'Antigo', ativo: true, contextPath: '/antigo', backends: [{ id: 1 }, { id: 2 }] };

describe('GatewayFormComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('não envia se faltarem os campos obrigatórios', async () => {
    const fixture = TestBed.createComponent(GatewayFormComponent);
    fixture.detectChanges();

    await fixture.componentInstance.enviar();

    httpMock.expectNone(URL);
    expect(fixture.componentInstance.form.controls.nome.touched).toBe(true);
  });

  it('valida o formato de IPv4, a porta de 4 caracteres e a lista de IDs', () => {
    const { form } = TestBed.createComponent(GatewayFormComponent).componentInstance;

    form.patchValue({ enderecoIp: '999.1.1.1', porta: '80', backendIds: 'a, b' });
    expect(form.controls.enderecoIp.invalid).toBe(true);
    expect(form.controls.porta.invalid).toBe(true);
    expect(form.controls.backendIds.invalid).toBe(true);

    form.patchValue({ enderecoIp: '10.0.0.1', porta: '8080', backendIds: '1, 2' });
    expect(form.controls.enderecoIp.valid).toBe(true);
    expect(form.controls.porta.valid).toBe(true);
    expect(form.controls.backendIds.valid).toBe(true);
  });

  it('cria via POST (sem pedir confirmação) e emite o gateway salvo', async () => {
    const fixture = TestBed.createComponent(GatewayFormComponent);
    fixture.detectChanges();
    const tela = fixture.componentInstance;
    let salvo: Gateway | undefined;
    tela.salvo.subscribe((g) => (salvo = g));

    tela.form.patchValue({ nome: 'Novo', contextPath: '/novo', backendIds: '1, 2' });
    await tela.enviar();

    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toMatchObject({ nome: 'Novo', contextPath: '/novo', backendIds: [1, 2] });
    req.flush({ ...EXISTENTE, id: 9, nome: 'Novo' });

    expect(salvo?.id).toBe(9);
    expect(TestBed.inject(ConfirmService).pendente()).toBeNull();
  });

  it('edição carrega o gateway, pede confirmação e só então faz PUT', async () => {
    const fixture = TestBed.createComponent(GatewayFormComponent);
    fixture.componentRef.setInput('gatewayId', 4);
    fixture.detectChanges(); // ngOnInit → GET
    httpMock.expectOne(`${URL}/4`).flush(EXISTENTE);
    const tela = fixture.componentInstance;

    expect(tela.modoEdicao()).toBe(true);
    expect(tela.form.controls.nome.value).toBe('Antigo');
    expect(tela.form.controls.backendIds.value).toBe('1, 2');

    const confirm = TestBed.inject(ConfirmService);
    const envio = tela.enviar();
    expect(confirm.pendente()?.titulo).toBe('Salvar alterações');
    httpMock.expectNone(`${URL}/4`);

    confirm.responder(true);
    await envio;

    const req = httpMock.expectOne(`${URL}/4`);
    expect(req.request.method).toBe('PUT');
    req.flush(EXISTENTE);
  });

  it('cancelar a confirmação de edição não chama a API', async () => {
    const fixture = TestBed.createComponent(GatewayFormComponent);
    fixture.componentRef.setInput('gatewayId', 4);
    fixture.detectChanges();
    httpMock.expectOne(`${URL}/4`).flush(EXISTENTE);

    const confirm = TestBed.inject(ConfirmService);
    const envio = fixture.componentInstance.enviar();
    confirm.responder(false);
    await envio;

    httpMock.expectNone(`${URL}/4`);
  });

  it('mantém os dados e mostra o erro quando salvar falha', async () => {
    const fixture = TestBed.createComponent(GatewayFormComponent);
    fixture.detectChanges();
    const tela = fixture.componentInstance;

    tela.form.patchValue({ nome: 'Novo', contextPath: '/novo', backendIds: '1' });
    await tela.enviar();
    httpMock.expectOne(URL).flush('erro', { status: 500, statusText: 'Server Error' });

    expect(tela.erro()).toContain('Erro no servidor');
    expect(tela.form.controls.nome.value).toBe('Novo');
    expect(tela.enviando()).toBe(false);
  });
});
