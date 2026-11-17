import { Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';
import { StatusSaude } from '../../../../shared/models/status.model';
import { Gateway } from '../../models/gateway.model';

const ORDEM_STATUS: StatusSaude[] = ['UP', 'DEGRADED', 'DOWN', 'UNKNOWN'];
const MAX_ATENCAO = 5;

const temBackendComProblema = (gateway: Gateway): boolean =>
  (gateway.backends ?? []).some((b) => b.status === 'DOWN' || b.status === 'DEGRADED');

/**
 * Visão geral dos gateways: indicadores, distribuição do status de todos os
 * backends e a lista de gateways que pedem atenção. Tudo calculado a partir
 * da lista já carregada (GET /v1/gateways), sem chamadas extras.
 */
@Component({
  selector: 'app-gateway-overview',
  standalone: true,
  imports: [StatCardComponent, StatusBadgeComponent, IconComponent],
  templateUrl: './gateway-overview.html',
  styleUrl: './gateway-overview.css',
})
export class GatewayOverviewComponent {
  readonly gateways = input.required<Gateway[]>();
  readonly detalhes = output<Gateway>();
  readonly verBackends = output<void>();

  readonly total = computed(() => this.gateways().length);
  readonly ativos = computed(() => this.gateways().filter((g) => g.ativo).length);
  readonly inativos = computed(() => this.total() - this.ativos());

  /** Gateway ativo com ao menos um backend DOWN ou DEGRADED. */
  private readonly gatewaysComProblemas = computed(() =>
    this.gateways().filter((g) => g.ativo && temBackendComProblema(g)),
  );
  readonly comProblemas = computed(() => this.gatewaysComProblemas().length);

  readonly atencao = computed(() =>
    this.gatewaysComProblemas()
      .slice(0, MAX_ATENCAO)
      .map((gateway) => ({
        gateway,
        problemas: (gateway.backends ?? []).filter((b) => b.status === 'DOWN' || b.status === 'DEGRADED'),
      })),
  );
  readonly atencaoExtras = computed(() => Math.max(this.comProblemas() - MAX_ATENCAO, 0));

  readonly totalBackends = computed(() =>
    this.gateways().reduce((soma, g) => soma + (g.backends ?? []).length, 0),
  );

  /** Backend sem status informado conta como UNKNOWN. */
  readonly distribuicao = computed(() => {
    const total = this.totalBackends();
    const contagem = new Map<StatusSaude, number>(ORDEM_STATUS.map((s) => [s, 0]));
    for (const gateway of this.gateways()) {
      for (const backend of gateway.backends ?? []) {
        const status = backend.status ?? 'UNKNOWN';
        contagem.set(status, (contagem.get(status) ?? 0) + 1);
      }
    }
    return ORDEM_STATUS.map((status) => {
      const quantidade = contagem.get(status) ?? 0;
      return { status, quantidade, percentual: total === 0 ? 0 : (quantidade / total) * 100 };
    });
  });
}
