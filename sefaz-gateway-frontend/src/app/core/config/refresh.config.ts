/**
 * Intervalo (em milissegundos) entre as atualizações automáticas de status.
 * Usado pela dashboard (lista de gateways, com o status dos backends) e pelo
 * painel de saúde da tela de detalhes. Mudar aqui altera os dois lugares.
 *
 * 30 segundos é um meio-termo: o status aparece atualizado sem sobrecarregar
 * a API/mock com chamadas a cada poucos segundos.
 *
 * Use 0 para DESLIGAR a atualização automática (só carrega ao abrir e quando
 * o usuário clicar em "atualizar"). Útil em demonstrações com um Mock Server
 * estático: como o mock não guarda alterações, cada atualização automática
 * traria de volta os dados originais.
 */
export const INTERVALO_ATUALIZACAO_STATUS_MS = 30_000;
