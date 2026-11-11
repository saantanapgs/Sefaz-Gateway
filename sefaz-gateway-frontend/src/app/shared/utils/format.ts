/**
 * Formata uma data/hora vinda da API (string). Se não for uma data válida,
 * devolve o texto original; se vier vazio, devolve "—".
 */
export function formatarDataHora(valor?: string | null): string {
  if (!valor) return '—';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

/** Classe CSS para o status (texto livre) de um pipeline do GitLab. */
export function classePipeline(status?: string | null): string {
  switch ((status ?? '').toLowerCase()) {
    case 'success':
    case 'passed':
      return 'pipeline--ok';
    case 'failed':
      return 'pipeline--erro';
    case 'running':
    case 'pending':
    case 'created':
    case 'preparing':
    case 'waiting_for_resource':
    case 'scheduled':
      return 'pipeline--andamento';
    default:
      return 'pipeline--neutro';
  }
}
