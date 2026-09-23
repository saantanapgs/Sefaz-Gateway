/** Corresponde a GatewayVersionDTO — retorno de GET /v1/gateways/{id}/versao. */
export interface GatewayVersion {
  gatewayId: number;
  nomeGateway: string;
  versaoGitlab: string;
}
