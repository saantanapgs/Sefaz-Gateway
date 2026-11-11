import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, switchMap } from 'rxjs';
import { INTERVALO_ATUALIZACAO_STATUS_MS } from '../../../../core/config/refresh.config';
import { mensagemDeErro } from '../../../../core/http/http-error';
import { ConfirmService } from '../../../../core/services/confirm';
import { NotificationService } from '../../../../core/services/notification';
import { atualizacaoPeriodica } from '../../../../core/utils/atualizacao-periodica';
import { ActionsMenuComponent, ItemMenu } from '../../../../shared/components/actions-menu/actions-menu';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { ModalComponent } from '../../../../shared/components/modal/modal';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';
import { ToggleSwitchComponent } from '../../../../shared/components/toggle-switch/toggle-switch';
import { Gateway } from '../../models/gateway.model';
import { GatewayService } from '../../services/gateway';
import { GatewayDetailsComponent } from '../gateway-details/gateway-details';
import { GatewayFormComponent } from '../gateway-form/gateway-form';

type FiltroStatus = 'todos' | 'ativos' | 'inativos';

const MAX_BACKENDS_NA_LINHA = 4;

/**
 * Tela única de Gateways: indicadores, busca/filtro, tabela com ações e os
 * modais de criar, editar e ver detalhes. Os dados (e o status dos backends
 * embutidos em cada gateway) são atualizados periodicamente.
 */
@Component({
  selector: 'app-gateway-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    StatCardComponent,
    StatusBadgeComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    ToggleSwitchComponent,
    ActionsMenuComponent,
    IconComponent,
    ModalComponent,
    GatewayFormComponent,
    GatewayDetailsComponent,
  ],
  templateUrl: './gateway-dashboard.html',
  styleUrl: './gateway-dashboard.css',
})
export class GatewayDashboardComponent {
  private readonly gatewayService = inject(GatewayService);
  private readonly confirm = inject(ConfirmService);
  private readonly notificacoes = inject(NotificationService);

  readonly gateways = signal<Gateway[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly avisoAtualizacao = signal<string | null>(null);
  readonly atualizadoEm = signal<Date | null>(null);
  readonly emAndamento = signal<number[]>([]);

  readonly termoBusca = signal('');
  readonly filtroStatus = signal<FiltroStatus>('todos');

  // Modais (no máximo um aberto por vez).
  readonly criando = signal(false);
  readonly gatewayEditando = signal<Gateway | null>(null);
  readonly gatewayDetalhando = signal<Gateway | null>(null);

  readonly intervaloSegundos = INTERVALO_ATUALIZACAO_STATUS_MS / 1000;

  readonly total = computed(() => this.gateways().length);
  readonly ativos = computed(() => this.gateways().filter((g) => g.ativo).length);
  readonly inativos = computed(() => this.total() - this.ativos());

  /** Gateway ativo com ao menos um backend DOWN ou DEGRADED (dados já vindos de GET /v1/gateways). */
  readonly comProblemas = computed(
    () =>
      this.gateways().filter(
        (g) => g.ativo && (g.backends ?? []).some((b) => b.status === 'DOWN' || b.status === 'DEGRADED'),
      ).length,
  );

  readonly linhas = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const filtro = this.filtroStatus();

    return this.gateways()
      .filter((g) => {
        const passaStatus = filtro === 'todos' || (filtro === 'ativos' ? g.ativo : !g.ativo);
        const passaBusca =
          termo.length === 0 ||
          [g.nome, g.host, g.contextPath].some((campo) => (campo ?? '').toLowerCase().includes(termo));
        return passaStatus && passaBusca;
      })
      .map((gateway) => {
        const backends = gateway.backends ?? [];
        return {
          gateway,
          totalBackends: backends.length,
          backendsVisiveis: backends.slice(0, MAX_BACKENDS_NA_LINHA),
          backendsExtras: Math.max(backends.length - MAX_BACKENDS_NA_LINHA, 0),
          menu: this.montarMenu(gateway),
        };
      });
  });

  private readonly recarregar$ = new Subject<void>();

  constructor() {
    atualizacaoPeriodica(INTERVALO_ATUALIZACAO_STATUS_MS, this.recarregar$)
      .pipe(
        switchMap(() =>
          this.gatewayService.listar().pipe(
            map((dados) => ({ ok: true as const, dados })),
            catchError((erro) => of({ ok: false as const, erro })),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((resposta) => {
        this.carregando.set(false);

        // Não sobrescreve a tela enquanto uma ação (ativar, excluir...) está em andamento.
        if (this.emAndamento().length > 0) return;

        if (resposta.ok) {
          this.gateways.set(resposta.dados);
          this.erro.set(null);
          this.avisoAtualizacao.set(null);
          this.atualizadoEm.set(new Date());
        } else if (this.atualizadoEm() === null) {
          this.erro.set(mensagemDeErro(resposta.erro, 'carregar os gateways'));
        } else {
          this.avisoAtualizacao.set(
            'Não foi possível atualizar agora. Exibindo os últimos dados carregados.',
          );
        }
      });
  }

  recarregar(): void {
    if (this.atualizadoEm() === null) {
      this.carregando.set(true);
      this.erro.set(null);
    }
    this.recarregar$.next();
  }

  estaEmAndamento(id: number): boolean {
    return this.emAndamento().includes(id);
  }

  // ---------------- modais ----------------
  abrirCriar(): void {
    this.fecharModais();
    this.criando.set(true);
  }

  abrirEdicao(gateway: Gateway): void {
    this.fecharModais();
    this.gatewayEditando.set(gateway);
  }

  abrirDetalhes(gateway: Gateway): void {
    this.fecharModais();
    this.gatewayDetalhando.set(gateway);
  }

  fecharModais(): void {
    this.criando.set(false);
    this.gatewayEditando.set(null);
    this.gatewayDetalhando.set(null);
  }

  aoSalvar(gateway: Gateway): void {
    const existia = this.gateways().some((g) => g.id === gateway.id);
    this.gateways.update((lista) =>
      existia ? lista.map((g) => (g.id === gateway.id ? gateway : g)) : [...lista, gateway],
    );
    this.fecharModais();
    this.notificacoes.sucesso(existia ? `Gateway "${gateway.nome}" atualizado.` : `Gateway "${gateway.nome}" criado.`);
  }

  // ---------------- menu e ações ----------------
  aoEscolherNoMenu(gateway: Gateway, acao: string): void {
    switch (acao) {
      case 'detalhes':
        this.abrirDetalhes(gateway);
        break;
      case 'editar':
        this.abrirEdicao(gateway);
        break;
      case 'alternar':
        void this.alternarAtivo(gateway);
        break;
      case 'excluir':
        void this.excluir(gateway);
        break;
    }
  }

  async alternarAtivo(gateway: Gateway): Promise<void> {
    if (this.estaEmAndamento(gateway.id)) return;

    const desativando = gateway.ativo;
    const confirmado = await this.confirm.confirmar({
      titulo: desativando ? 'Desativar gateway' : 'Ativar gateway',
      mensagem: desativando
        ? `Desativar o gateway "${gateway.nome}"? Ele deixará de estar ativo.`
        : `Ativar o gateway "${gateway.nome}"?`,
      rotuloConfirmar: desativando ? 'Desativar' : 'Ativar',
      perigo: desativando,
    });
    if (!confirmado) return;

    this.marcar(gateway.id, true);
    const requisicao = desativando
      ? this.gatewayService.desativar(gateway.id)
      : this.gatewayService.ativar(gateway.id);

    requisicao.subscribe({
      next: (atualizado) => {
        this.gateways.update((lista) => lista.map((g) => (g.id === atualizado.id ? atualizado : g)));
        this.marcar(gateway.id, false);
        this.notificacoes.sucesso(`Gateway "${gateway.nome}" ${desativando ? 'desativado' : 'ativado'}.`);
      },
      error: (erro) => {
        this.marcar(gateway.id, false);
        this.notificacoes.erro(mensagemDeErro(erro, desativando ? 'desativar o gateway' : 'ativar o gateway'));
      },
    });
  }

  async excluir(gateway: Gateway): Promise<void> {
    if (this.estaEmAndamento(gateway.id)) return;

    const confirmado = await this.confirm.confirmar({
      titulo: 'Excluir gateway',
      mensagem: `Excluir o gateway "${gateway.nome}"? Essa ação não pode ser desfeita.`,
      rotuloConfirmar: 'Excluir',
      perigo: true,
    });
    if (!confirmado) return;

    this.marcar(gateway.id, true);
    this.gatewayService.deletar(gateway.id).subscribe({
      next: () => {
        this.gateways.update((lista) => lista.filter((g) => g.id !== gateway.id));
        this.marcar(gateway.id, false);
        this.notificacoes.sucesso(`Gateway "${gateway.nome}" excluído.`);
      },
      error: (erro) => {
        this.marcar(gateway.id, false);
        this.notificacoes.erro(mensagemDeErro(erro, 'excluir o gateway'));
      },
    });
  }

  private montarMenu(gateway: Gateway): ItemMenu[] {
    return [
      { id: 'detalhes', rotulo: 'Ver detalhes', icone: 'eye' },
      { id: 'editar', rotulo: 'Editar', icone: 'edit' },
      { id: 'alternar', rotulo: gateway.ativo ? 'Desativar' : 'Ativar', icone: 'power' },
      { id: 'excluir', rotulo: 'Excluir', icone: 'trash', perigo: true },
    ];
  }

  private marcar(id: number, emAndamento: boolean): void {
    this.emAndamento.update((lista) => (emAndamento ? [...lista, id] : lista.filter((x) => x !== id)));
  }
}
