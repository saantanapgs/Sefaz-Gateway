// SNIPPET DE INTEGRAÇÃO — mescle com o seu app.routes.ts existente,
// não sobrescreva rotas de outras features que já existam nele.
import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  {
    path: 'gateways',
    loadChildren: () => import('./features/gateway/gateway.routes').then((m) => m.GATEWAY_ROUTES),
  },
  // ... demais rotas do projeto continuam aqui.
];
