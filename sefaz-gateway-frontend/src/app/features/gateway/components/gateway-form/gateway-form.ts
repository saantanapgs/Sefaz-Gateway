import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GatewayService } from '../../services/gateway';
import { Gateway, GatewayCreate } from '../../models/gateway.model';
import { ConfirmService } from '../../../../core/services/confirm';
import { mensagemDeErro } from '../../../../core/http/http-error';

// Mesma regex de enderecoIp do Swagger (GatewayCreateDTO / GatewayUpdateDTO).
const REGEX_IPV4 = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/;
// Lista de números separados por vírgula: "1, 2, 3".
const REGEX_LISTA_IDS = /^\s*\d+(\s*,\s*\d+)*\s*$/;

/**
 * Formulário de criação e edição de Gateway, pensado para viver dentro de um
 * <app-modal>. Sem `gatewayId` cria (POST); com `gatewayId` carrega o gateway
 * (GET) e edita (PUT), pedindo confirmação antes de salvar.
 */
@Component({
  selector: 'app-gateway-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './gateway-form.html',
  styleUrl: './gateway-form.css',
})
export class GatewayFormComponent implements OnInit {
  readonly gatewayId = input<number | null>(null);
  readonly salvo = output<Gateway>();
  readonly cancelado = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly gatewayService = inject(GatewayService);
  private readonly confirm = inject(ConfirmService);

  readonly modoEdicao = computed(() => this.gatewayId() !== null);
  readonly carregando = signal(false);
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  // NOTA: backendIds é digitado como lista separada por vírgula porque a
  // feature de Backend não existe (fora do escopo), então não há um seletor
  // de backends. Quando existir, troque este campo por um multi-select.
  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    contextPath: ['', [Validators.required, Validators.maxLength(150)]],
    backendIds: ['', [Validators.required, Validators.pattern(REGEX_LISTA_IDS)]],
    descricao: ['', [Validators.maxLength(255)]],
    host: ['', [Validators.maxLength(150)]],
    porta: ['', [Validators.minLength(4), Validators.maxLength(4)]],
    enderecoIp: ['', [Validators.pattern(REGEX_IPV4)]],
    rateLimit: this.fb.control<number | null>(null, [Validators.min(1), Validators.max(10000)]),
    tentativasRetentativa: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(10)]),
    gitlabId: this.fb.control<number | null>(null),
    ativo: [true],
    tags: [''],
    urlMetricas: ['', [Validators.maxLength(255)]],
    urlExterna: ['', [Validators.maxLength(255)]],
    urlInterna: ['', [Validators.maxLength(255)]],
  });

  ngOnInit(): void {
    const id = this.gatewayId();
    if (id !== null) this.carregarParaEdicao(id);
  }

  private carregarParaEdicao(id: number): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.gatewayService.buscar(id).subscribe({
      next: (gateway) => {
        this.form.patchValue({
          nome: gateway.nome,
          contextPath: gateway.contextPath,
          backendIds: (gateway.backends ?? []).map((b) => b.id).join(', '),
          descricao: gateway.descricao ?? '',
          host: gateway.host ?? '',
          porta: gateway.porta ?? '',
          enderecoIp: gateway.enderecoIp ?? '',
          rateLimit: gateway.rateLimit ?? null,
          tentativasRetentativa: gateway.tentativasRetentativa ?? null,
          gitlabId: gateway.gitlabId ?? null,
          ativo: gateway.ativo,
          tags: (gateway.tags ?? []).join(', '),
          urlMetricas: gateway.urlMetricas ?? '',
          urlExterna: gateway.urlExterna ?? '',
          urlInterna: gateway.urlInterna ?? '',
        });
        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set(mensagemDeErro(err, 'carregar o gateway para edição'));
        this.carregando.set(false);
      },
    });
  }

  async enviar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const id = this.gatewayId();

    if (id !== null) {
      const confirmado = await this.confirm.confirmar({
        titulo: 'Salvar alterações',
        mensagem: `Confirmar as alterações no gateway "${valores.nome}"?`,
        rotuloConfirmar: 'Salvar alterações',
      });
      if (!confirmado) return;
    }

    // GatewayCreate e GatewayUpdate têm os mesmos campos (no Update todos são
    // opcionais), então o mesmo corpo serve para os dois.
    const corpo: GatewayCreate = {
      nome: valores.nome,
      contextPath: valores.contextPath,
      backendIds: this.listaDeIds(valores.backendIds),
      descricao: valores.descricao || undefined,
      host: valores.host || undefined,
      porta: valores.porta || undefined,
      enderecoIp: valores.enderecoIp || undefined,
      rateLimit: valores.rateLimit ?? undefined,
      tentativasRetentativa: valores.tentativasRetentativa ?? undefined,
      gitlabId: valores.gitlabId ?? undefined,
      ativo: valores.ativo,
      tags: this.listaDeTags(valores.tags),
      urlMetricas: valores.urlMetricas || undefined,
      urlExterna: valores.urlExterna || undefined,
      urlInterna: valores.urlInterna || undefined,
    };

    this.enviando.set(true);
    this.erro.set(null);

    const requisicao = id !== null ? this.gatewayService.atualizar(id, corpo) : this.gatewayService.criar(corpo);

    requisicao.subscribe({
      next: (gateway) => {
        this.enviando.set(false);
        this.salvo.emit(gateway);
      },
      error: (err) => {
        this.erro.set(mensagemDeErro(err, id !== null ? 'salvar as alterações' : 'criar o gateway'));
        this.enviando.set(false);
      },
    });
  }

  private listaDeIds(valor: string): number[] {
    return valor
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map(Number);
  }

  private listaDeTags(valor: string): string[] {
    return valor
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }
}
