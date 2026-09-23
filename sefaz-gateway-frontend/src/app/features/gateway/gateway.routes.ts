import { Routes } from '@angular/router';
import { GatewayListComponent } from './components/gateway-list/gateway-list';
import { GatewayFormComponent } from './components/gateway-form/gateway-form';
import { GatewayDetailsComponent } from './components/gateway-details/gateway-details';

export const GATEWAY_ROUTES: Routes = [
  { path: '', component: GatewayListComponent },
  { path: 'novo', component: GatewayFormComponent },
  { path: ':id', component: GatewayDetailsComponent },
  { path: ':id/editar', component: GatewayFormComponent },
];
