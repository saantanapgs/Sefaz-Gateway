import { StatusSaude } from '../../../shared/models/status.model';

/**
 * Corresponde a GatewayBackendResponseDTO — versão resumida de um Backend,
 * embutida dentro de GatewayResponseDTO.backends.
 */
export interface GatewayBackendResumo {
  id: number;
  descricao?: string;
  status?: StatusSaude;
  baseUrl?: string;
}

/**
 * Corresponde a GatewayResponseDTO.
 */
export interface Gateway {
  id: number;
  nome: string;
  enderecoIp?: string;
  ativo: boolean;
  contextPath: string;
  gitlabId?: number;
  tags?: string[];
  porta?: string;
  tentativasRetentativa?: number;
  host?: string;
  descricao?: string;
  urlMetricas?: string;
  urlExterna?: string;
  urlInterna?: string;
  rateLimit?: number;
  backends: GatewayBackendResumo[];
}

/**
 * Corresponde a GatewayCreateDTO.
 * Obrigatórios no Swagger: nome, contextPath, backendIds.
 */
export interface GatewayCreate {
  nome: string;
  contextPath: string;
  backendIds: number[];
  enderecoIp?: string;
  ativo?: boolean;
  gitlabId?: number;
  tags?: string[];
  porta?: string;
  tentativasRetentativa?: number;
  host?: string;
  descricao?: string;
  urlMetricas?: string;
  urlExterna?: string;
  urlInterna?: string;
  rateLimit?: number;
}

/**
 * Corresponde a GatewayUpdateDTO.
 * No Swagger nenhum campo é obrigatório aqui (mesmo sendo um PUT) —
 * por isso todos os campos são opcionais nesta interface.
 */
export interface GatewayUpdate {
  nome?: string;
  contextPath?: string;
  backendIds?: number[];
  enderecoIp?: string;
  ativo?: boolean;
  gitlabId?: number;
  tags?: string[];
  porta?: string;
  tentativasRetentativa?: number;
  host?: string;
  descricao?: string;
  urlMetricas?: string;
  urlExterna?: string;
  urlInterna?: string;
  rateLimit?: number;
}
