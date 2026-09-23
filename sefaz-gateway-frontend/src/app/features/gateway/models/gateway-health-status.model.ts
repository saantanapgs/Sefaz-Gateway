import { StatusSaude } from '../../../shared/models/status.model';

/** Corresponde a BackendStatusItem (usado dentro de GatewayHealthStatusDTO.backends). */
export interface BackendStatusItem {
  backendId: number;
  nome: string;
  ultimoStatus: StatusSaude;
  dataUltimaVerificacao?: string;
}

/** Corresponde a GatewayHealthStatusDTO — retorno de GET /v1/gateways/{id}/status. */
export interface GatewayHealthStatus {
  gatewayId: number;
  nomeGateway: string;
  ativo: boolean;
  statusAgregado: StatusSaude;
  totalBackends: number;
  totalUp: number;
  totalDown: number;
  totalUnknown: number;
  backends: BackendStatusItem[];
}
