import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GatewayService } from '../../services/gateway';
import { GatewayCreate, GatewayUpdate } from '../../models/gateway.model';

// Mesma regex de validação de enderecoIp definida no Swagger (GatewayCreateDTO/GatewayUpdateDTO).
const REGEX_IPV4 = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/;

@Component({
  selector: 'app-gateway-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './gateway-form.html',
  styleUrl: './gateway-form.scss',
})
export class GatewayFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly gatewayService = inject(GatewayService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly modoEdicao = signal(false);
  readonly gatewayId = signal<number | null>(null);
  readonly carregando = signal(false);
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  // NOTA: backendIds é digitado como uma lista separada por vírgula porque a
  // feature de Backend ainda não existe (fora do escopo desta entrega) — não
  // há, portanto, um seletor de backends existentes. Quando Backend estiver
  // pronto, o ideal é trocar esse campo por um multi-select alimentado pelo
  // BackendService, sem precisar mudar o restante do formulário.
  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    contextPath: ['', [Validators.required, Validators.maxLength(150)]],
    backendIds: ['', [Validators.required]],
    enderecoIp: ['', [Validators.pattern(REGEX_IPV4)]],
    host: ['', [Validators.maxLength(150)]],
    porta: ['', [Validators.minLength(4), Validators.maxLength(4)]],
    descricao: ['', [Validators.maxLength(255)]],
    ativo: [true],
    gitlabId: this.fb.control<number | null>(null),
    tentativasRetentativa: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(10)]),
    rateLimit: this.fb.control<number | null>(null, [Validators.min(1), Validators.max(10000)]),
    tags: [''],
    urlMetricas: ['', [Validators.maxLength(255)]],
    urlExterna: ['', [Validators.maxLength(255)]],
    urlInterna: ['', [Validators.maxLength(255)]],
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.modoEdicao.set(true);
      this.gatewayId.set(id);
      this.carregarParaEdicao(id);
    }
  }

  private carregarParaEdicao(id: number): void {
    this.carregando.set(true);
    this.gatewayService.buscar(id).subscribe({
      next: (gateway) => {
        this.form.patchValue({
          nome: gateway.nome,
          contextPath: gateway.contextPath,
          enderecoIp: gateway.enderecoIp ?? '',
          host: gateway.host ?? '',
          porta: gateway.porta ?? '',
          descricao: gateway.descricao ?? '',
          ativo: gateway.ativo,
          gitlabId: gateway.gitlabId ?? null,
          tentativasRetentativa: gateway.tentativasRetentativa ?? null,
          rateLimit: gateway.rateLimit ?? null,
          tags: (gateway.tags ?? []).join(', '),
          backendIds: (gateway.backends ?? []).map((b) => b.id).join(', '),
          urlMetricas: gateway.urlMetricas ?? '',
          urlExterna: gateway.urlExterna ?? '',
          urlInterna: gateway.urlInterna ?? '',
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o gateway para edição.');
        this.carregando.set(false);
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

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    this.enviando.set(true);
    this.erro.set(null);

    if (this.modoEdicao()) {
      const dto: GatewayUpdate = {
        nome: valores.nome,
        contextPath: valores.contextPath,
        backendIds: this.listaDeIds(valores.backendIds),
        enderecoIp: valores.enderecoIp || undefined,
        host: valores.host || undefined,
        porta: valores.porta || undefined,
        descricao: valores.descricao || undefined,
        ativo: valores.ativo,
        gitlabId: valores.gitlabId ?? undefined,
        tentativasRetentativa: valores.tentativasRetentativa ?? undefined,
        rateLimit: valores.rateLimit ?? undefined,
        tags: this.listaDeTags(valores.tags),
        urlMetricas: valores.urlMetricas || undefined,
        urlExterna: valores.urlExterna || undefined,
        urlInterna: valores.urlInterna || undefined,
      };

      this.gatewayService.atualizar(this.gatewayId()!, dto).subscribe({
        next: () => this.router.navigate(['/gateways', this.gatewayId()]),
        error: () => {
          this.erro.set('Não foi possível salvar as alterações.');
          this.enviando.set(false);
        },
      });
    } else {
      const dto: GatewayCreate = {
        nome: valores.nome,
        contextPath: valores.contextPath,
        backendIds: this.listaDeIds(valores.backendIds),
        enderecoIp: valores.enderecoIp || undefined,
        host: valores.host || undefined,
        porta: valores.porta || undefined,
        descricao: valores.descricao || undefined,
        ativo: valores.ativo,
        gitlabId: valores.gitlabId ?? undefined,
        tentativasRetentativa: valores.tentativasRetentativa ?? undefined,
        rateLimit: valores.rateLimit ?? undefined,
        tags: this.listaDeTags(valores.tags),
        urlMetricas: valores.urlMetricas || undefined,
        urlExterna: valores.urlExterna || undefined,
        urlInterna: valores.urlInterna || undefined,
      };

      this.gatewayService.criar(dto).subscribe({
        next: (criado) => this.router.navigate(['/gateways', criado.id]),
        error: () => {
          this.erro.set('Não foi possível criar o gateway.');
          this.enviando.set(false);
        },
      });
    }
  }
}
