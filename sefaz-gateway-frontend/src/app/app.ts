import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GatewayListComponent } from './features/gateway/components/gateway-list/gateway-list';

imports: [
  GatewayListComponent
]
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('sefaz-gateway-frontend');
}
