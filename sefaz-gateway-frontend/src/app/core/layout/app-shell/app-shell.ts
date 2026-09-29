import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/**
 * Casca visual da aplicação: sidebar de navegação + header + área de conteúdo
 * (router-outlet). Não tem lógica de negócio — só estrutura e navegação.
 *
 * Para usar: no componente raiz do projeto (o "App"/"AppComponent" que já
 * existe), troque o template pra conter só <app-shell></app-shell>, e
 * adicione AppShellComponent aos imports desse componente raiz.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShellComponent {}
