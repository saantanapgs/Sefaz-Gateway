import { Component, OnInit, inject, input, signal } from '@angular/core';
import { mensagemDeErro } from '../../../../core/http/http-error';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { ModalComponent } from '../../../../shared/components/modal/modal';
import { GitLabPipeline } from '../../../../shared/models/gitlab-pipeline.model';
import { classePipeline, formatarDataHora } from '../../../../shared/utils/format';
import { GatewayBackendResumo } from '../../models/gateway.model';
import { GatewayService } from '../../services/gateway';
import { PipelineDetailsComponent } from '../pipeline-details/pipeline-details';
import { PipelineTriggerComponent } from '../pipeline-trigger/pipeline-trigger';

/**
 * Lista de pipelines do gateway (carregada só quando este conteúdo abre).
 * Clicar num pipeline abre o modal com os detalhes e o disparo; também há um
 * botão para disparar um novo pipeline direto da lista.
 */
@Component({
  selector: 'app-gateway-pipelines',
  standalone: true,
  imports: [
    IconComponent,
    ModalComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    PipelineDetailsComponent,
    PipelineTriggerComponent,
  ],
  templateUrl: './gateway-pipelines.html',
  styleUrl: './gateway-pipelines.css',
})
export class GatewayPipelinesComponent implements OnInit {
  readonly gatewayId = input.required<number>();
  readonly backends = input.required<GatewayBackendResumo[]>();

  private readonly gatewayService = inject(GatewayService);

  readonly pipelines = signal<GitLabPipeline[] | null>(null);
  readonly erro = signal<string | null>(null);
  readonly selecionado = signal<GitLabPipeline | null>(null);
  readonly disparoAberto = signal(false);

  readonly classePipeline = classePipeline;
  readonly formatarDataHora = formatarDataHora;

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.pipelines.set(null);
    this.erro.set(null);
    this.gatewayService.pipelines(this.gatewayId()).subscribe({
      next: (dados) => this.pipelines.set(dados),
      error: (erro) => this.erro.set(mensagemDeErro(erro, 'carregar os pipelines')),
    });
  }
}
