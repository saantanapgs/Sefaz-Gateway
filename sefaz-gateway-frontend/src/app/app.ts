import { Component, signal } from '@angular/core';
import { OverlaysComponent } from './core/layout/overlays/overlays';
import { GatewayDashboardComponent } from './features/gateway/components/gateway-dashboard/gateway-dashboard';

@Component({
  selector: 'app-root',
  imports: [GatewayDashboardComponent, OverlaysComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('sefaz-gateway-frontend');
}
