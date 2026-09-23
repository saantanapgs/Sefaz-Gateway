import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Preparado para a integração futura com Keycloak (JWT).
 *
 * O Swagger define segurança Bearer global, mas o Keycloak ainda não está
 * implementado neste momento. Este interceptor já fica plugado no pipeline
 * de HTTP (ver app.config.ts) para que, quando o AuthService existir, baste:
 *
 *   1. injetar o AuthService aqui;
 *   2. obter o token real no lugar da constante `token` abaixo;
 *
 * Nenhum GatewayService (ou futuro BackendService) precisa ser alterado
 * quando isso acontecer — essa é a vantagem de centralizar o header aqui.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token: string | null = null; // TODO: obter do AuthService quando o Keycloak for integrado

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq);
};
