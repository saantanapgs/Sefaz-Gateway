import { Routes } from '@angular/router';
import { GatewayDashboardComponent } from './components/gateway-dashboard/gateway-dashboard';

// Tela única: listagem, indicadores e ações ficam na dashboard.
// Criar, editar e ver detalhes abrem em modais dentro dela (sem rotas próprias).
export const GATEWAY_ROUTES: Routes = [{ path: '', component: GatewayDashboardComponent }];
