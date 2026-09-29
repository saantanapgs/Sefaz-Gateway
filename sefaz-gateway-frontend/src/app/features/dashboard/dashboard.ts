import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GatewayService } from '../gateway/services/gateway';
import { Gateway } from '../gateway/models/gateway.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';

/**
 * Visão geral dos Gateways. Usa só GET /v1/gateways (uma chamada) — os
 * indicadores são calculados a partir dos dados que esse endpoint já
 * devolve (incluindo os backends embutidos em cada gateway), sem chamadas
 * extras por gateway. Detalhes por gateway (status agregado, versão,
 * pipelines, contagem de endpoints) continuam só na tela de detalhes.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, StatCardComponent, StatusBadgeComponent, ErrorStateComponent, EmptyStateComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  private readonly gatewayService = inject(GatewayService);

  readonly gateways = signal<Gateway[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);

  readonly total = computed(() => this.gateways().length);
  readonly ativos = computed(() => this.gateways().filter((g) => g.ativo).length);
  readonly inativos = computed(() => this.total() - this.ativos());

  /**
   * "Com problemas": gateway ativo que tem pelo menos um backend embutido
   * com status DOWN ou DEGRADED. Usa só os dados já trazidos por
   * GET /v1/gateways — nenhuma chamada extra.
   */
  readonly comProblemas = computed(
    () =>
      this.gateways().filter(
        (g) => g.ativo && (g.backends ?? []).some((b) => b.status === 'DOWN' || b.status === 'DEGRADED')
      ).length
  );

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.gatewayService.listar().subscribe({
      next: (dados) => {
        this.gateways.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os gateways para montar a dashboard.');
        this.carregando.set(false);
      },
    });
  }
}
