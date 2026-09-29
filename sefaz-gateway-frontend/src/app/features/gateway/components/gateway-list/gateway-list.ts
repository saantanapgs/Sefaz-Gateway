import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GatewayService } from '../../services/gateway';
import { Gateway } from '../../models/gateway.model';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

type FiltroStatus = 'todos' | 'ativos' | 'inativos';

@Component({
  selector: 'app-gateway-list',
  standalone: true,
  imports: [RouterLink, ErrorStateComponent, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './gateway-list.html',
  styleUrl: './gateway-list.scss',
})
export class GatewayListComponent {
  private readonly gatewayService = inject(GatewayService);

  readonly gateways = signal<Gateway[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly termoBusca = signal('');
  readonly filtroStatus = signal<FiltroStatus>('todos');

  readonly gatewayParaExcluir = signal<Gateway | null>(null);

  readonly gatewaysFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const filtro = this.filtroStatus();

    return this.gateways().filter((g) => {
      const passaBusca = termo.length === 0 || g.nome.toLowerCase().includes(termo);
      const passaStatus = filtro === 'todos' || (filtro === 'ativos' ? g.ativo : !g.ativo);
      return passaBusca && passaStatus;
    });
  });

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
        this.erro.set('Não foi possível carregar os gateways. Verifique se o Mock Server está acessível.');
        this.carregando.set(false);
      },
    });
  }

  alternarAtivo(gateway: Gateway): void {
    const acao = gateway.ativo
      ? this.gatewayService.desativar(gateway.id)
      : this.gatewayService.ativar(gateway.id);

    acao.subscribe({
      next: (atualizado) => {
        this.gateways.update((lista) => lista.map((g) => (g.id === atualizado.id ? atualizado : g)));
      },
      error: () => this.erro.set(`Não foi possível alterar o status do gateway "${gateway.nome}".`),
    });
  }

  pedirConfirmacaoExclusao(gateway: Gateway): void {
    this.gatewayParaExcluir.set(gateway);
  }

  cancelarExclusao(): void {
    this.gatewayParaExcluir.set(null);
  }

  confirmarExclusao(): void {
    const gateway = this.gatewayParaExcluir();
    if (!gateway) return;

    this.gatewayService.deletar(gateway.id).subscribe({
      next: () => {
        this.gateways.update((lista) => lista.filter((g) => g.id !== gateway.id));
        this.gatewayParaExcluir.set(null);
      },
      error: () => {
        this.erro.set(`Não foi possível excluir o gateway "${gateway.nome}".`);
        this.gatewayParaExcluir.set(null);
      },
    });
  }
}
