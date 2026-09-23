import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GatewayService } from '../../services/gateway';
import { Gateway } from '../../models/gateway.model';
import { GatewayHealthStatus } from '../../models/gateway-health-status.model';
import { GatewayVersion } from '../../models/gateway-version.model';
import { GatewayEndpointCount } from '../../models/gateway-endpoint-count.model';
import { GitLabPipeline } from '../../../../shared/models/gitlab-pipeline.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-gateway-details',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './gateway-details.html',
  styleUrl: './gateway-details.scss',
})
export class GatewayDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly gatewayService = inject(GatewayService);

  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  readonly gateway = signal<Gateway | null>(null);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);

  readonly saude = signal<GatewayHealthStatus | null>(null);
  readonly erroSaude = signal<string | null>(null);

  readonly versao = signal<GatewayVersion | null>(null);
  readonly erroVersao = signal<string | null>(null);

  readonly pipelines = signal<GitLabPipeline[]>([]);
  readonly erroPipelines = signal<string | null>(null);

  readonly contagemEndpoints = signal<GatewayEndpointCount | null>(null);
  readonly erroContagem = signal<string | null>(null);

  readonly statusPipelineConsultado = signal<GitLabPipeline | null>(null);
  readonly erroStatusPipeline = signal<string | null>(null);

  constructor() {
    this.carregarGateway();
    this.carregarSaude();
    this.carregarVersao();
    this.carregarPipelines();
    this.carregarContagemEndpoints();
  }

  private carregarGateway(): void {
    this.gatewayService.buscar(this.id).subscribe({
      next: (dados) => {
        this.gateway.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o gateway.');
        this.carregando.set(false);
      },
    });
  }

  private carregarSaude(): void {
    this.gatewayService.status(this.id).subscribe({
      next: (dados) => this.saude.set(dados),
      error: () => this.erroSaude.set('Status indisponível no momento.'),
    });
  }

  private carregarVersao(): void {
    this.gatewayService.versao(this.id).subscribe({
      next: (dados) => this.versao.set(dados),
      error: () => this.erroVersao.set('Versão indisponível no momento.'),
    });
  }

  private carregarPipelines(): void {
    this.gatewayService.pipelines(this.id).subscribe({
      next: (dados) => this.pipelines.set(dados),
      error: () => this.erroPipelines.set('Pipelines indisponíveis no momento.'),
    });
  }

  private carregarContagemEndpoints(): void {
    this.gatewayService.contagemEndpoints(this.id).subscribe({
      next: (dados) => this.contagemEndpoints.set(dados),
      error: () => this.erroContagem.set('Contagem indisponível no momento.'),
    });
  }

  consultarStatusPipeline(pipelineId: number | null): void {
    this.erroStatusPipeline.set(null);
    this.gatewayService.statusPipeline(this.id, pipelineId).subscribe({
      next: (dados) => this.statusPipelineConsultado.set(dados),
      error: () => this.erroStatusPipeline.set('Não foi possível consultar o status desse pipeline.'),
    });
  }
}
