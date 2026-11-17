import { Component, computed, input, output, signal } from '@angular/core';
import { CopyButtonComponent } from '../../../../shared/components/copy-button/copy-button';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';
import { StatusSaude } from '../../../../shared/models/status.model';
import { Gateway } from '../../models/gateway.model';

type Filtro = 'todos' | StatusSaude;

/**
 * Todos os backends de todos os gateways numa lista só, filtrável por status.
 * Usa o que já veio em GET /v1/gateways (backend sem status conta como UNKNOWN).
 */
@Component({
  selector: 'app-gateway-backends-list',
  standalone: true,
  imports: [StatusBadgeComponent, CopyButtonComponent, EmptyStateComponent],
  templateUrl: './gateway-backends-list.html',
  styleUrl: './gateway-backends-list.css',
})
export class GatewayBackendsListComponent {
  readonly gateways = input.required<Gateway[]>();
  readonly abrirGateway = output<Gateway>();

  readonly filtro = signal<Filtro>('todos');

  readonly itens = computed(() =>
    this.gateways().flatMap((gateway) =>
      (gateway.backends ?? []).map((backend) => ({
        gateway,
        backend,
        status: (backend.status ?? 'UNKNOWN') as StatusSaude,
      })),
    ),
  );

  readonly filtrados = computed(() => {
    const filtro = this.filtro();
    return filtro === 'todos' ? this.itens() : this.itens().filter((item) => item.status === filtro);
  });
}
