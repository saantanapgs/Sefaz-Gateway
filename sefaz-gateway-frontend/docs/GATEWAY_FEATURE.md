# Feature Gateway — Sefaz Gateway Frontend

## Estrutura

```
src/app/
  core/interceptors/auth.interceptor.ts   # preparado para JWT/Keycloak (hoje é passthrough)
  shared/
    models/status.model.ts                # StatusSaude: UP | DOWN | DEGRADED | UNKNOWN
    models/gitlab-pipeline.model.ts        # compartilhado com futura feature Backend
    components/status-badge/               # badge reutilizável de status
  features/gateway/
    models/                                # Gateway, GatewayCreate, GatewayUpdate,
                                            # GatewayHealthStatus, GatewayVersion, GatewayEndpointCount
    services/gateway.ts                    # único ponto de contato com /v1/gateways
    components/
      gateway-list/                        # GET /v1/gateways
      gateway-form/                        # POST/PUT (criar e editar)
      gateway-details/                     # GET por id + status/versao/pipelines/endpoints
    gateway.routes.ts                      # rotas da feature
```

## Configuração da API

A URL base fica em `src/environments/environment*.ts`, no campo `apiBaseUrl`.
Está como um placeholder (`http://SUBSTITUA-PELA-URL-DO-MOCK-SERVER`) —
troque pela URL real do Mock Server fornecida pela equipe.

Trocar de Mock Server para API real depois é uma alteração de **uma linha**,
nesse arquivo, porque nenhum service usa URL fixa (`GatewayService` monta a
URL a partir de `environment.apiBaseUrl`).

## Como executar

```bash
npm install
ng serve
```

Acesse `/gateways` para a listagem.

## Endpoints consumidos

| Método | Endpoint | Onde é usado |
|---|---|---|
| GET | `/v1/gateways` | GatewayListComponent |
| POST | `/v1/gateways` | GatewayFormComponent (criar) |
| GET | `/v1/gateways/{id}` | GatewayDetailsComponent, GatewayFormComponent (editar) |
| PUT | `/v1/gateways/{id}` | GatewayFormComponent (editar) |
| DELETE | `/v1/gateways/{id}` | GatewayListComponent |
| PATCH | `/v1/gateways/{id}/ativar` | GatewayListComponent |
| PATCH | `/v1/gateways/{id}/desativar` | GatewayListComponent |
| GET | `/v1/gateways/{id}/status` | GatewayDetailsComponent |
| GET | `/v1/gateways/{id}/versao` | GatewayDetailsComponent |
| GET | `/v1/gateways/{id}/pipelines` | GatewayDetailsComponent |
| GET | `/v1/gateways/{id}/pipeline/status` | GatewayDetailsComponent (consulta sob demanda) |
| GET | `/v1/gateways/{id}/endpoints/contagem` | GatewayDetailsComponent |

## Limitação conhecida

O campo `backendIds` no formulário é uma lista de IDs separada por vírgula,
porque a feature de Backend ainda não existe (fora de escopo desta entrega).
Quando Backend estiver pronto, trocar esse campo por um seletor alimentado
pelo `BackendService` é a única mudança necessária no formulário.

## Como replicar esse padrão para outra feature (ex.: Backend)

1. Criar `models/` a partir dos DTOs reais do Swagger daquele recurso.
2. Criar um `service` único, com um método por endpoint, usando `environment.apiBaseUrl`.
3. Criar os componentes de tela (list/form/details) injetando **apenas o service**, nunca `HttpClient` direto.
4. Reaproveitar `shared/components/status-badge` se o recurso também usa o enum `StatusSaude`.
5. Criar um arquivo `<feature>.routes.ts` e ligá-lo em `app.routes.ts` via `loadChildren`.
6. Escrever os testes do service com `HttpTestingController`, um `it` por endpoint.
