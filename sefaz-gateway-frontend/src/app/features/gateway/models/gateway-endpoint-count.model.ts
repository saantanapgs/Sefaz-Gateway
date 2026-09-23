/** Corresponde a GatewayEndpointCountDTO — retorno de GET /v1/gateways/{id}/endpoints/contagem. */
export interface GatewayEndpointCount {
  gatewayId: number;
  nomeGateway: string;
  totalBackends: number;
  fonte: string;
}
