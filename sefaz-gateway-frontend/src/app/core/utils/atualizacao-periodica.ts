import { merge, Observable, timer } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/**
 * Emite imediatamente, depois a cada `intervaloMs`, e também sempre que
 * `manual$` emitir (botão "atualizar"). Pula os ciclos automáticos enquanto
 * a aba do navegador estiver oculta, para não consultar a API à toa.
 * Com `intervaloMs <= 0` emite só a primeira vez (e nas atualizações manuais).
 */
export function atualizacaoPeriodica(intervaloMs: number, manual$: Observable<void>): Observable<void> {
  const base$ = intervaloMs > 0 ? timer(0, intervaloMs) : timer(0);
  const automatica$ = base$.pipe(
    filter(() => typeof document === 'undefined' || !document.hidden),
    map(() => undefined)
  );
  return merge(automatica$, manual$);
}
