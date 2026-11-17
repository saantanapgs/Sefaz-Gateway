import { NgTemplateOutlet } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { ActionsMenuComponent, ItemMenu } from '../../../../shared/components/actions-menu/actions-menu';
import { CopyButtonComponent } from '../../../../shared/components/copy-button/copy-button';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';
import { ToggleSwitchComponent } from '../../../../shared/components/toggle-switch/toggle-switch';
import { Gateway, GatewayBackendResumo } from '../../models/gateway.model';

export interface LinhaGateway {
  gateway: Gateway;
  totalBackends: number;
  backendsVisiveis: GatewayBackendResumo[];
  backendsExtras: number;
  menu: ItemMenu[];
}

export interface AcaoDoMenu {
  gateway: Gateway;
  acao: string;
}

type Visao = 'resumo' | 'rede' | 'limites';

const VISOES: { id: Visao; rotulo: string }[] = [
  { id: 'resumo', rotulo: 'Resumo' },
  { id: 'rede', rotulo: 'Rede e URLs' },
  { id: 'limites', rotulo: 'Limites' },
];

/**
 * Tabela de gateways com três visões alternáveis. Cada visão mostra um grupo
 * diferente de campos, para a tela não acumular colunas: o dado é o mesmo
 * (já carregado), só muda o que aparece.
 */
@Component({
  selector: 'app-gateway-table',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    StatusBadgeComponent,
    ToggleSwitchComponent,
    ActionsMenuComponent,
    CopyButtonComponent,
  ],
  templateUrl: './gateway-table.html',
  styleUrl: './gateway-table.css',
})
export class GatewayTableComponent {
  readonly linhas = input.required<LinhaGateway[]>();
  readonly emAndamento = input<number[]>([]);

  readonly detalhes = output<Gateway>();
  readonly acao = output<AcaoDoMenu>();
  readonly alternar = output<Gateway>();

  readonly visoes = VISOES;
  readonly visao = signal<Visao>('resumo');

  estaEmAndamento(id: number): boolean {
    return this.emAndamento().includes(id);
  }
}
