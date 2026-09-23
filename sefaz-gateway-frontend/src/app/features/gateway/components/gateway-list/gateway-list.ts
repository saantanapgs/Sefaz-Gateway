import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GatewayService } from '../../services/gateway';
import { Gateway } from '../../models/gateway.model';

@Component({
  selector: 'app-gateway-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './gateway-list.html',
  styleUrl: './gateway-list.scss',
})
export class GatewayListComponent {
  private readonly gatewayService = inject(GatewayService);

  readonly gateways = signal<Gateway[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.gatewayService.listar().subscribe({
      next: (dados) => {
  console.log('GATEWAYS RECEBIDOS PELO COMPONENTE:', dados);
  console.log('QUANTIDADE:', dados.length);

  this.gateways.set(dados);
  this.carregando.set(false);
},
      error: (erro) => {
  console.error('ERRO AO CARREGAR GATEWAYS:', erro);

  this.erro.set(
    'Não foi possível carregar os gateways. Verifique se o Mock Server está acessível.'
  );

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

  excluir(gateway: Gateway): void {
    const confirmado = confirm(`Excluir o gateway "${gateway.nome}"? Essa ação não pode ser desfeita.`);
    if (!confirmado) return;

    this.gatewayService.deletar(gateway.id).subscribe({
      next: () => this.gateways.update((lista) => lista.filter((g) => g.id !== gateway.id)),
      error: () => this.erro.set(`Não foi possível excluir o gateway "${gateway.nome}".`),
    });
  }
}
