import { Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';
import { Gateway } from '../../models/gateway.model';

const MAX_ATENCAO = 5;

const temBackendComProblema = (gateway: Gateway): boolean =>
  (gateway.backends ?? []).some((b) => b.status === 'DOWN' || b.status === 'DEGRADED');

/**
 * Visão geral dos gateways: indicadores e a lista de gateways que pedem atenção. Tudo calculado a partir
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
}
