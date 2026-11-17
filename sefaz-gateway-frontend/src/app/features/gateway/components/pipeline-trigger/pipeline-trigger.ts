import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { mensagemDeErro } from '../../../../core/http/http-error';
import { ConfirmService } from '../../../../core/services/confirm';
import { NotificationService } from '../../../../core/services/notification';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { GitLabPipeline } from '../../../../shared/models/gitlab-pipeline.model';
import { classePipeline } from '../../../../shared/utils/format';
import { GatewayBackendResumo } from '../../models/gateway.model';
import { BackendPipelineService } from '../../services/backend-pipeline';

/**
 * Formulário para disparar um novo pipeline: escolhe o backend e a branch (ref)
 * e confirma. Usa POST /v1/backends/{id}/runpipe, o único endpoint de disparo
 * do Swagger (ele pertence ao Backend, não existe um para Gateway).
 */
@Component({
  selector: 'app-pipeline-trigger',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './pipeline-trigger.html',
  styleUrl: './pipeline-trigger.css',
})
export class PipelineTriggerComponent {
  readonly backends = input.required<GatewayBackendResumo[]>();
  readonly refInicial = input('main');
  readonly disparado = output<GitLabPipeline>();

  private readonly pipelineService = inject(BackendPipelineService);
  private readonly confirm = inject(ConfirmService);
  private readonly notificacoes = inject(NotificationService);

  private readonly backendEscolhido = signal<number | null>(null);
  readonly ref = linkedSignal(() => this.refInicial());
  readonly backendSelecionado = computed(() => this.backendEscolhido() ?? this.backends()[0]?.id ?? null);
  readonly disparando = signal(false);
  readonly ultimo = signal<{ backend: string; pipeline: GitLabPipeline } | null>(null);
  readonly classePipeline = classePipeline;

  escolherBackend(valor: string): void {
    this.backendEscolhido.set(Number(valor));
  }

  nomeDoBackend(backend: GatewayBackendResumo): string {
    return backend.descricao || `Backend #${backend.id}`;
  }

  async disparar(): Promise<void> {
    const id = this.backendSelecionado();
    const backend = this.backends().find((b) => b.id === id);
    if (!backend || this.disparando()) return;

    const ref = this.ref().trim() || 'main';
    const nome = this.nomeDoBackend(backend);
    const confirmado = await this.confirm.confirmar({
      titulo: 'Disparar pipeline',
      mensagem: `Disparar um novo pipeline do backend "${nome}" na branch "${ref}"? Isso inicia uma nova execução no GitLab.`,
      rotuloConfirmar: 'Disparar pipeline',
    });
    if (!confirmado) return;

    this.disparando.set(true);
    this.pipelineService.executar(backend.id, ref).subscribe({
      next: (pipeline) => {
        this.disparando.set(false);
        this.ultimo.set({ backend: nome, pipeline });
        this.notificacoes.sucesso(`Pipeline #${pipeline.iid} disparado para "${nome}".`);
        this.disparado.emit(pipeline);
      },
      error: (erro) => {
        this.disparando.set(false);
        this.notificacoes.erro(mensagemDeErro(erro, 'disparar o pipeline'));
      },
    });
  }
}
