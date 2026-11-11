import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/gateway/gateway.routes').then((m) => m.GATEWAY_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
