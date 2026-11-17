import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, switchMap } from 'rxjs';
import { INTERVALO_ATUALIZACAO_STATUS_MS } from '../../../../core/config/refresh.config';
import { eNaoEncontrado, mensagemDeErro } from '../../../../core/http/http-error';
import { atualizacaoPeriodica } from '../../../../core/utils/atualizacao-periodica';
import { CopyButtonComponent } from '../../../../shared/components/copy-button/copy-button';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { ModalComponent } from '../../../../shared/components/modal/modal';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';
import { StatusSaude } from '../../../../shared/models/status.model';
import { formatarDataHora } from '../../../../shared/utils/format';
import { Gateway, GatewayBackendResumo } from '../../models/gateway.model';
import { GatewayEndpointCount } from '../../models/gateway-endpoint-count.model';
import { GatewayHealthStatus } from '../../models/gateway-health-status.model';
import { GatewayVersion } from '../../models/gateway-version.model';
import { GatewayAiService } from '../../services/gateway-ai';
import { GatewayService } from '../../services/gateway';
import { GatewayPipelinesComponent } from '../gateway-pipelines/gateway-pipelines';

export type SecaoDetalhes = 'saude' | 'pipelines' | 'backends' | 'configuracao' | 'rede';

const TITULOS: Record<SecaoDetalhes, string> = {
  saude: 'Saúde dos backends',
  pipelines: 'Pipelines',
  backends: 'Backends vinculados',
  configuracao: 'Configuração',
  rede: 'Rede e URLs',
};

/**
 * Detalhes de um gateway, pensados para viver dentro de um <app-modal>.
 * Mostra só o essencial (cabeçalho, resumo e três fatos rápidos) e um cartão
 * para cada assunto; cada cartão abre o seu próprio modal. Pipelines só são
 * carregados quando o modal de pipelines abre.
 */
@Component({
  selector: 'app-gateway-details',
  standalone: true,
  imports: [
    DatePipe,
    StatusBadgeComponent,
    ErrorStateComponent,
    IconComponent,
    ModalComponent,
    CopyButtonComponent,
    GatewayPipelinesComponent,
  ],
  templateUrl: './gateway-details.html',
  styleUrl: './gateway-details.css',
})
export class GatewayDetailsComponent implements OnInit {
  readonly gatewayId = input.required<number>();
  readonly editar = output<void>();

  private readonly gatewayService = inject(GatewayService);
  private readonly gatewayAiService = inject(GatewayAiService);
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

  readonly resumo = signal<string | null>(null);
  readonly secao = signal<SecaoDetalhes | null>(null);

  readonly backends = computed<GatewayBackendResumo[]>(() => this.gateway()?.backends ?? []);
  readonly tituloDaSecao = computed(() => (this.secao() ? TITULOS[this.secao()!] : ''));

  readonly intervaloSegundos = INTERVALO_ATUALIZACAO_STATUS_MS / 1000;
  readonly formatarDataHora = formatarDataHora;

  private readonly atualizarSaude$ = new Subject<void>();

  ngOnInit(): void {
    this.carregarGateway();
    this.carregarVersao();
    this.carregarContagem();
    this.acompanharSaude();
  }

  abrir(secao: SecaoDetalhes): void {
    this.secao.set(secao);
  }

  fecharSecao(): void {
    this.secao.set(null);
  }

  recarregar(): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.carregarGateway();
  }

  atualizarSaude(): void {
    this.atualizarSaude$.next();
  }

  nomeDoBackend(backend: GatewayBackendResumo): string {
    return backend.descricao || `Backend #${backend.id}`;
  }

  /** O status mais recente (painel de saúde) tem prioridade sobre o que veio embutido no gateway. */
  statusDoBackend(backend: GatewayBackendResumo): StatusSaude {
    const atual = this.saude()?.backends?.find((b) => b.backendId === backend.id)?.ultimoStatus;
    return atual ?? backend.status ?? 'UNKNOWN';
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
          eNaoEncontrado(erro)
            ? 'Gateway não encontrado. Ele pode ter sido excluído.'
            : mensagemDeErro(erro, 'carregar o gateway'),
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

  private atualizarResumo(): void {
    const gateway = this.gateway();
    if (!gateway) return;
    this.gatewayAiService.resumir(gateway, this.saude()).subscribe((texto) => this.resumo.set(texto));
  }
}
