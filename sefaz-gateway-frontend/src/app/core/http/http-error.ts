import { HttpErrorResponse } from '@angular/common/http';

/**
 * Converte um erro de HTTP numa mensagem compreensível para o usuário.
 * `acao` completa a frase: "carregar os gateways", "excluir o gateway"...
 */
export function mensagemDeErro(erro: unknown, acao: string): string {
  if (erro instanceof HttpErrorResponse) {
    if (erro.status === 0) {
      return `API indisponível: não foi possível ${acao}. Verifique a conexão ou o Mock Server.`;
    }
    if (erro.status === 401 || erro.status === 403) {
      return `Sem permissão para ${acao}.`;
    }
    if (erro.status === 404) {
      return `Registro não encontrado: não foi possível ${acao}.`;
    }
    if (erro.status === 400 || erro.status === 422) {
      return `Dados inválidos: não foi possível ${acao}.`;
    }
    if (erro.status >= 500) {
      return `Erro no servidor ao tentar ${acao}. Tente novamente em instantes.`;
    }
  }
  return `Não foi possível ${acao}.`;
}

export function eNaoEncontrado(erro: unknown): boolean {
  return erro instanceof HttpErrorResponse && erro.status === 404;
}
