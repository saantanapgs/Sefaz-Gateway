import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Gateway } from '../models/gateway.model';
import { GatewayHealthStatus } from '../models/gateway-health-status.model';

/**
 * PREPARAÇÃO para uma futura feature de "resumo inteligente do Gateway".
 *
 * Hoje isso NÃO chama nenhuma IA de verdade — só monta um resumo simples
 * a partir dos dados que a própria API já devolve (nada inventado). Isso
 * existe pra já isolar, num único lugar, o ponto onde uma integração real
 * de IA entraria futuramente: quando ela existir, só o método `resumir`
 * muda (troca o texto montado na mão por uma chamada real), nenhum
 * componente que já usa esse service precisa ser alterado.
 */
@Injectable({ providedIn: 'root' })
export class GatewayAiService {
  resumir(gateway: Gateway, saude: GatewayHealthStatus | null): Observable<string> {
    if (!saude) {
      return of(`${gateway.nome}: dados de status ainda não disponíveis para gerar um resumo.`);
    }

    const texto =
      `${gateway.nome} está ${saude.statusAgregado} no momento, com ` +
      `${saude.totalUp} de ${saude.totalBackends} backend(s) operando normalmente` +
      (saude.totalDown > 0 ? `, ${saude.totalDown} fora do ar` : '') +
      '.';

    return of(texto);
  }
}
