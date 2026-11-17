import { DatePipe } from '@angular/common';
import { Component, input, linkedSignal, signal } from '@angular/core';
import { mensagemDeErro } from '../../../../core/http/http-error';
import { CopyButtonComponent } from '../../../../shared/components/copy-button/copy-button';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { GitLabPipeline } from '../../../../shared/models/gitlab-pipeline.model';
import { classePipeline, formatarDataHora } from '../../../../shared/utils/format';
import { GatewayBackendResumo } from '../../models/gateway.model';
import { GatewayService } from '../../services/gateway';
import { PipelineTriggerComponent } from '../pipeline-trigger/pipeline-trigger';

/**
 * Detalhes de um pipeline do gateway: todos os campos devolvidos pela API,
 * atualização do status (GET .../pipeline/status?pipelineId) e o disparo de
 * um novo pipeline.
 */
@Component({
  selector: 'app-pipeline-details',
  standalone: true,
  imports: [DatePipe, IconComponent, CopyButtonComponent, PipelineTriggerComponent],
  templateUrl: './pipeline-details.html',
  styleUrl: './pipeline-details.css',
})
export class PipelineDetailsComponent {
  readonly gatewayId = input.required<number>();
  readonly pipeline = input.required<GitLabPipeline>();
  readonly backends = input.required<GatewayBackendResumo[]>();

  readonly atual = linkedSignal(() => this.pipeline());
  readonly atualizando = signal(false);
  readonly atualizadoEm = signal<Date | null>(null);
  readonly erro = signal<string | null>(null);

  readonly classePipeline = classePipeline;
  readonly formatarDataHora = formatarDataHora;

  constructor(private readonly gatewayService: GatewayService) {}

  atualizarStatus(): void {
    this.atualizando.set(true);
    this.erro.set(null);
    this.gatewayService.statusPipeline(this.gatewayId(), this.atual().id).subscribe({
      next: (pipeline) => {
        this.atual.set(pipeline);
        this.atualizadoEm.set(new Date());
        this.atualizando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'atualizar o status do pipeline'));
        this.atualizando.set(false);
      },
    });
  }
}
