// SNIPPET DE INTEGRAÇÃO — inalterado desde a entrega da feature Gateway.
// Adicione provideHttpClient(withInterceptors([authInterceptor])) ao seu
// app.config.ts existente, sem remover providers que já estejam lá.
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
