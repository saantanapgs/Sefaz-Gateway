import { Routes } from '@angular/router';

import { GatewayListComponent } from './features/gateway/components/gateway-list/gateway-list';
import { GatewayFormComponent } from './features/gateway/components/gateway-form/gateway-form';
import { GatewayDetailsComponent } from './features/gateway/components/gateway-details/gateway-details';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'gateways',
    pathMatch: 'full',
  },
  {
    path: 'gateways',
    component: GatewayListComponent,
  },
  {
    path: 'gateways/novo',
    component: GatewayFormComponent,
  },
  {
    path: 'gateways/:id',
    component: GatewayDetailsComponent,
  },
  {
    path: 'gateways/:id/editar',
    component: GatewayFormComponent,
  },
];
