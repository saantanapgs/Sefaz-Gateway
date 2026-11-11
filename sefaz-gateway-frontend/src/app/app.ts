import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OverlaysComponent } from './core/layout/overlays/overlays';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OverlaysComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('sefaz-gateway-frontend');
}
