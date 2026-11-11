# Feature Gateway — Sefaz Gateway Frontend

## Visão geral

Uma única tela (`/`) concentra tudo de Gateway: indicadores, busca e filtro, tabela com
ações e três modais (criar, editar, ver detalhes). Não há rotas separadas para essas telas;
qualquer outra URL redireciona para `/`.

O componente central é o `GatewayDashboardComponent`, que fica **dentro** da feature
`gateway` (a dashboard é uma visão de Gateways, não uma feature à parte).

## Estilos

Todo o estilo é CSS puro (`.css`), sem SCSS: `src/styles.css` (tokens, `.btn`, `.banner`) e um
`.css` por componente. Aninhamento e `&` não são usados; cada seletor é escrito por extenso
(ex.: `.painel__corpo`, `.btn--primario`). Sem Angular Material: os componentes de UI são próprios.

## Estrutura

```
src/app/
  core/
    config/refresh.config.ts        # intervalo da atualização automática (0 = desligada)
    http/http-error.ts              # erro HTTP -> mensagem para o usuário
    interceptors/auth.interceptor.ts# preparado para JWT/Keycloak (hoje só repassa)
    layout/overlays/                # desenha UMA vez o diálogo de confirmação e os toasts
    services/confirm.ts             # ConfirmService: await confirmar({...})
    services/notification.ts        # NotificationService: sucesso/erro/info
    utils/atualizacao-periodica.ts  # timer + botão "atualizar" + pausa com aba oculta
  shared/
    components/                     # stat-card, status-badge, error-state, empty-state,
                                    # confirm-dialog, modal, toggle-switch, actions-menu,
                                    # icon, toast-container
    models/, utils/format.ts
  features/gateway/
    components/gateway-dashboard/   # tela única
    components/gateway-form/        # criar/editar (dentro de modal)
    components/gateway-details/     # detalhes (dentro de modal)
    services/gateway.ts             # /v1/gateways
    services/backend-pipeline.ts    # POST /v1/backends/{id}/runpipe (ver observação)
    services/gateway-ai.ts          # resumo por regras (placeholder para IA futura)
    models/
    gateway.routes.ts
```

## Comportamento

- **Ativar/desativar**: toggle na linha (ou item do menu). Pede confirmação; o toggle só muda
  depois que a API responde OK.
- **Editar**: abre o formulário em modal; ao salvar, pede confirmação antes do PUT.
- **Excluir**: pede confirmação (botão vermelho) antes do DELETE.
- **Menu "três pontos"**: ver detalhes, editar, ativar/desativar, excluir.
- **Feedback**: toasts de sucesso/erro após cada ação (não há mais troca de página).
- **Status dos backends**: a lista (GET /v1/gateways) e o painel de saúde dos detalhes são
  atualizados a cada `INTERVALO_ATUALIZACAO_STATUS_MS` (30 s), pausando com a aba oculta.
  O botão de atualizar força na hora. Se uma atualização falhar, os últimos dados continuam na
  tela com um aviso.

## Endpoints consumidos

| Método | Endpoint | Onde |
|---|---|---|
| GET | `/v1/gateways` | dashboard (lista + indicadores), atualizada periodicamente |
| POST | `/v1/gateways` | modal de criação |
| GET | `/v1/gateways/{id}` | detalhes; carregar dados na edição |
| PUT | `/v1/gateways/{id}` | modal de edição |
| DELETE | `/v1/gateways/{id}` | ação excluir |
| PATCH | `/v1/gateways/{id}/ativar` e `/desativar` | toggle / menu |
| GET | `/v1/gateways/{id}/status` | detalhes (saúde, atualizada periodicamente) |
| GET | `/v1/gateways/{id}/versao` | detalhes |
| GET | `/v1/gateways/{id}/endpoints/contagem` | detalhes |
| GET | `/v1/gateways/{id}/pipelines` | detalhes |
| GET | `/v1/gateways/{id}/pipeline/status` | detalhes (consulta sob demanda) |
| POST | `/v1/backends/{id}/runpipe?ref=` | detalhes: "Disparar pipeline" por backend |

**Observação sobre o disparo de pipeline:** o Swagger não tem endpoint para disparar pipeline de
Gateway. O único é o de Backend (`/v1/backends/{id}/runpipe`), usado com os backends vinculados ao
gateway. É o único endpoint de Backend em uso e deve migrar para um `BackendService` se a feature de
Backend for criada. O pipeline disparado é de um backend e **não** aparece na lista de pipelines do gateway.

## Mock estático

Se o Mock Server não guardar estado, criar/editar/excluir/ativar parecem funcionar na tela mas a
próxima atualização automática traz os dados originais. Para demonstrações, use
`INTERVALO_ATUALIZACAO_STATUS_MS = 0` em `core/config/refresh.config.ts`.

## Como rodar e testar

```bash
npm ci
npx ng build     # produção, com os budgets do angular.json
npx ng test --no-watch
```

Para replicar o padrão em outra feature: models a partir do Swagger, um service por recurso,
componentes que só usam o service, `ConfirmService`/`NotificationService` para confirmar e avisar.
