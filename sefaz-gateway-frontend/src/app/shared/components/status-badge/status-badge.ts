import { Component, input } from '@angular/core';
import { StatusSaude } from '../../models/status.model';

/**
 * Componente reutilizável: recebe um StatusSaude (UP/DOWN/DEGRADED/UNKNOWN)
 * e exibe um badge colorido. Não conhece Gateway nem Backend especificamente,
 * por isso pode ser usado por qualquer feature que exponha esse enum.
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadgeComponent {
  readonly status = input.required<StatusSaude>();
}
