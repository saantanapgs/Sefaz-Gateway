import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, switchMap } from 'rxjs';
import { INTERVALO_ATUALIZACAO_STATUS_MS } from '../../../../core/config/refresh.config';
import { eNaoEncontrado, mensagemDeErro } from '../../../../core/http/http-error';
import { ConfirmService } from '../../../../core/services/confirm';
import { NotificationService } from '../../../../core/services/notification';
import { atualizacaoPeriodica } from '../../../../core/utils/atualizacao-periodica';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';
import { GitLabPipeline } from '../../../../shared/models/gitlab-pipeline.model';
import { classePipeline, formatarDataHora } from '../../../../shared/utils/format';
import { Gateway, GatewayBackendResumo } from '../../models/gateway.model';
import { GatewayEndpointCount } from '../../models/gateway-endpoint-count.model';
import { GatewayHealthStatus } from '../../models/gateway-health-status.model';
import { GatewayVersion } from '../../models/gateway-version.model';
import { BackendPipelineService } from '../../services/backend-pipeline';
import { GatewayAiService } from '../../services/gateway-ai';
import { GatewayService } from '../../services/gateway';

/**
 * Detalhes de um gateway, pensados para viver dentro de um <app-modal>.
 * Cada bloco (saúde, versão, pipelines, contagem) carrega de forma
 * independente: se um falhar, os outros continuam aparecendo.
 */
@Component({
  selector: 'app-gateway-details',
  standalone: true,
  imports: [DatePipe, StatusBadgeComponent, ErrorStateComponent, IconComponent],
  templateUrl: './gateway-details.html',
  styleUrl: './gateway-details.css',
})
export class GatewayDetailsComponent implements OnInit {
  readonly gatewayId = input.required<number>();
  readonly editar = output<void>();

  private readonly gatewayService = inject(GatewayService);
  private readonly pipelineService = inject(BackendPipelineService);
  private readonly gatewayAiService = inject(GatewayAiService);
  private readonly confirm = inject(ConfirmService);
  private readonly notificacoes = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly gateway = signal<Gateway | null>(null);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);

  readonly saude = signal<GatewayHealthStatus | null>(null);
  readonly erroSaude = signal<string | null>(null);
  readonly saudeAtualizadaEm = signal<Date | null>(null);

  readonly versao = signal<GatewayVersion | null>(null);
  readonly erroVersao = signal<string | null>(null);

  readonly contagem = signal<GatewayEndpointCount | null>(null);
  readonly erroContagem = signal<string | null>(null);

  readonly pipelines = signal<GitLabPipeline[] | null>(null);
  readonly erroPipelines = signal<string | null>(null);

  readonly statusPipelineConsultado = signal<GitLabPipeline | null>(null);
  readonly erroStatusPipeline = signal<string | null>(null);

  readonly resumo = signal<string | null>(null);

  // Disparo de pipeline (por backend do gateway).
  readonly ref = signal('main');
  readonly disparando = signal<number | null>(null);
  readonly ultimoDisparo = signal<{ backend: string; pipeline: GitLabPipeline } | null>(null);

  readonly intervaloSegundos = INTERVALO_ATUALIZACAO_STATUS_MS / 1000;
  readonly classePipeline = classePipeline;
  readonly formatarDataHora = formatarDataHora;

  private readonly atualizarSaude$ = new Subject<void>();

  ngOnInit(): void {
    this.carregarGateway();
    this.carregarVersao();
    this.carregarContagem();
    this.carregarPipelines();
    this.acompanharSaude();
  }

  recarregar(): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.carregarGateway();
  }

  atualizarSaude(): void {
    this.atualizarSaude$.next();
  }

  private carregarGateway(): void {
    this.gatewayService.buscar(this.gatewayId()).subscribe({
      next: (dados) => {
        this.gateway.set(dados);
        this.carregando.set(false);
        this.atualizarResumo();
      },
      error: (erro) => {
        this.erro.set(
          eNaoEncontrado(erro) ? 'Gateway não encontrado. Ele pode ter sido excluído.' : mensagemDeErro(erro, 'carregar o gateway'),
        );
        this.carregando.set(false);
      },
    });
  }

  private acompanharSaude(): void {
    atualizacaoPeriodica(INTERVALO_ATUALIZACAO_STATUS_MS, this.atualizarSaude$)
      .pipe(
        switchMap(() =>
          this.gatewayService.status(this.gatewayId()).pipe(
            map((dados) => ({ ok: true as const, dados })),
            catchError((erro) => of({ ok: false as const, erro })),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((resposta) => {
        if (resposta.ok) {
          this.saude.set(resposta.dados);
          this.erroSaude.set(null);
          this.saudeAtualizadaEm.set(new Date());
          this.atualizarResumo();
        } else {
          this.erroSaude.set(mensagemDeErro(resposta.erro, 'carregar o status'));
        }
      });
  }

  private carregarVersao(): void {
    this.gatewayService.versao(this.gatewayId()).subscribe({
      next: (dados) => this.versao.set(dados),
      error: (erro) => this.erroVersao.set(mensagemDeErro(erro, 'carregar a versão')),
    });
  }

  private carregarContagem(): void {
    this.gatewayService.contagemEndpoints(this.gatewayId()).subscribe({
      next: (dados) => this.contagem.set(dados),
      error: (erro) => this.erroContagem.set(mensagemDeErro(erro, 'carregar a contagem')),
    });
  }

  private carregarPipelines(): void {
    this.gatewayService.pipelines(this.gatewayId()).subscribe({
      next: (dados) => this.pipelines.set(dados),
      error: (erro) => this.erroPipelines.set(mensagemDeErro(erro, 'carregar os pipelines')),
    });
  }

  private atualizarResumo(): void {
    const gateway = this.gateway();
    if (!gateway) return;
    this.gatewayAiService.resumir(gateway, this.saude()).subscribe((texto) => this.resumo.set(texto));
  }

  consultarStatusPipeline(pipelineId: number | null): void {
    this.erroStatusPipeline.set(null);
    this.gatewayService.statusPipeline(this.gatewayId(), pipelineId).subscribe({
      next: (dados) => this.statusPipelineConsultado.set(dados),
      error: (erro) => this.erroStatusPipeline.set(mensagemDeErro(erro, 'consultar o status do pipeline')),
    });
  }

  nomeDoBackend(backend: GatewayBackendResumo): string {
    return backend.descricao || `Backend #${backend.id}`;
  }

  async dispararPipeline(backend: GatewayBackendResumo): Promise<void> {
    if (this.disparando() !== null) return;

    const ref = this.ref().trim() || 'main';
    const nome = this.nomeDoBackend(backend);
    const confirmado = await this.confirm.confirmar({
      titulo: 'Disparar pipeline',
      mensagem: `Disparar um novo pipeline do backend "${nome}" na branch "${ref}"? Isso inicia uma nova execução no GitLab.`,
      rotuloConfirmar: 'Disparar pipeline',
    });
    if (!confirmado) return;

    this.disparando.set(backend.id);
    this.pipelineService.executar(backend.id, ref).subscribe({
      next: (pipeline) => {
        this.disparando.set(null);
        this.ultimoDisparo.set({ backend: nome, pipeline });
        this.notificacoes.sucesso(`Pipeline #${pipeline.iid} disparado para "${nome}".`);
      },
      error: (erro) => {
        this.disparando.set(null);
        this.notificacoes.erro(mensagemDeErro(erro, 'disparar o pipeline'));
      },
    });
  }
}
