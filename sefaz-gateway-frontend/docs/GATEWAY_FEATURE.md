# Feature Gateway — Sefaz Gateway Frontend

## Visão geral

Uma única tela concentra tudo de Gateway. **Não existe roteamento** (nenhum arquivo de rotas, nenhum
`provideRouter`, nenhum `RouterOutlet`): o `App` renderiza o `GatewayDashboardComponent` direto, e a
navegação é feita por estado, abrindo modais dentro da própria tela.

O que é "informação demais" não fica na tela: cada assunto vive no seu modal e só aparece quando
o usuário clica.

## Estrutura

```
src/app/
  app.ts / app.html            # <app-gateway-dashboard /> + <app-overlays />
  core/
    config/refresh.config.ts   # intervalo de atualização automática (0 = desligada)
    http/http-error.ts         # erro HTTP -> mensagem para o usuário
    interceptors/              # auth.interceptor (preparado para JWT/Keycloak)
    layout/overlays/           # desenha UMA vez o diálogo de confirmação e os toasts
    services/                  # ConfirmService, NotificationService
    utils/atualizacao-periodica.ts
  shared/
    components/                # stat-card, status-badge, error-state, empty-state,
                               # confirm-dialog, modal, toggle-switch, actions-menu,
                               # icon, toast-container, copy-button
    models/, utils/format.ts
  features/gateway/
    models/
    services/                  # gateway.ts, backend-pipeline.ts, gateway-ai.ts
    components/
      gateway-dashboard/       # contêiner: estado, atualização periódica, ações, modais
      gateway-overview/        # indicadores + status dos backends + "requer atenção"
      gateway-table/           # tabela com 3 visões (Resumo, Rede e URLs, Limites)
      gateway-backends-list/   # todos os backends de todos os gateways (modal)
      gateway-form/            # criar/editar (modal)
      gateway-details/         # detalhes enxutos: cartões que abrem um modal cada
      gateway-pipelines/       # lista de pipelines (modal dentro dos detalhes)
      pipeline-details/        # um pipeline: campos, atualizar status, disparar
      pipeline-trigger/        # backend + branch + confirmação + disparo
```

## Dashboard

- **Indicadores:** total, ativos, inativos, com problemas (ativo e com backend DOWN/DEGRADED).
- **Status dos backends:** barra de distribuição (UP, DEGRADED, DOWN, UNKNOWN) de todos os backends;
  backend sem status conta como UNKNOWN. "Ver backends" abre a lista completa, filtrável.
- **Requer atenção:** até 5 gateways ativos com backends fora do ar ou degradados; clicar abre os detalhes.
- **Tabela com visões:** *Resumo* (host, backends, situação com toggle), *Rede e URLs* (host, IP, URL
  externa/interna/métricas, com botão de copiar) e *Limites* (rate limit, retentativas, GitLab ID).
- Busca por nome, host, context path, IP ou tag; filtro ativo/inativo.
- Tudo é calculado a partir de **uma** chamada (`GET /v1/gateways`), sem chamada extra por gateway.

## Detalhes (modais)

Cabeçalho, resumo automático e três fatos (host, versão, backends). Cinco cartões, cada um abre um modal:
**Saúde** (atualizada periodicamente), **Pipelines**, **Backends vinculados**, **Configuração**, **Rede e URLs**.
Em **Pipelines**, clicar num pipeline abre os seus detalhes (todos os campos, atualizar status, disparar);
"Disparar novo" abre o formulário de disparo. A lista só é carregada quando o modal de pipelines abre.

## Ações

Ativar/desativar (toggle ou menu), editar (confirma ao salvar), excluir e disparar pipeline pedem
confirmação (`ConfirmService`). Cada ação mostra um toast de sucesso ou erro (`NotificationService`).

## Endpoints consumidos

| Método | Endpoint | Onde |
|---|---|---|
| GET | `/v1/gateways` | dashboard (lista, indicadores, backends), atualizada periodicamente |
| POST | `/v1/gateways` | modal de criação |
| GET | `/v1/gateways/{id}` | detalhes; carregar dados na edição |
| PUT | `/v1/gateways/{id}` | modal de edição |
| DELETE | `/v1/gateways/{id}` | excluir |
| PATCH | `/v1/gateways/{id}/ativar` e `/desativar` | toggle / menu |
| GET | `/v1/gateways/{id}/status` | detalhes: saúde (atualizada periodicamente) |
| GET | `/v1/gateways/{id}/versao` | detalhes |
| GET | `/v1/gateways/{id}/endpoints/contagem` | detalhes |
| GET | `/v1/gateways/{id}/pipelines` | modal de pipelines |
| GET | `/v1/gateways/{id}/pipeline/status?pipelineId=` | detalhes do pipeline (atualizar status) |
| POST | `/v1/backends/{id}/runpipe?ref=` | disparar pipeline |

**Disparar pipeline:** o Swagger não tem endpoint para disparar nem reexecutar pipeline de Gateway.
O único é `POST /v1/backends/{id}/runpipe`, que cria um **novo** pipeline em um backend vinculado ao
gateway (por isso o formulário pede o backend). É o único endpoint de Backend em uso e deve migrar para um
`BackendService` se a feature de Backend for criada. O pipeline disparado é de um backend e não aparece
na lista de pipelines do gateway.

## Mock estático

Se o Mock Server não guardar estado, criar/editar/excluir/ativar parecem funcionar na tela, mas a próxima
atualização automática traz os dados originais. Para demonstrações, use
`INTERVALO_ATUALIZACAO_STATUS_MS = 0` em `core/config/refresh.config.ts`.

## Estilos

CSS puro (`.css`), sem SCSS e sem Angular Material. `src/styles.css` tem os tokens, `.btn`, `.banner` e
`.etiqueta`; cada componente tem o seu `.css`. Sem aninhamento: cada seletor é escrito por extenso.

## Como rodar e testar

```bash
npm ci
npx ng build
npx ng test --no-watch
```
