import api from "./api";

// Todas as chamadas levam o token automaticamente (interceptor em api.js).
// A API só responde a quem é tutor de um dos dois pets do match.

export async function buscarConversas() {
  const resposta = await api.get("/chat/conversas");
  return resposta.data.conversas;
}

export async function buscarMensagens(matchId, { depoisDe, antesDe, limite } = {}) {
  const resposta = await api.get(
    `/chat/conversas/${encodeURIComponent(matchId)}/mensagens`,
    { params: { depoisDe, antesDe, limite } },
  );
  return resposta.data;
}

export async function enviarMensagem(matchId, texto) {
  const resposta = await api.post(
    `/chat/conversas/${encodeURIComponent(matchId)}/mensagens`,
    { texto },
  );
  return resposta.data.mensagem;
}

export async function bloquearConversa(matchId) {
  const resposta = await api.post(
    `/chat/conversas/${encodeURIComponent(matchId)}/bloqueio`,
  );
  return resposta.data;
}

export async function desbloquearConversa(matchId) {
  const resposta = await api.delete(
    `/chat/conversas/${encodeURIComponent(matchId)}/bloqueio`,
  );
  return resposta.data;
}

// A API responde erros como { success: false, message, code }.
export function mensagemDeErro(falha, padrao) {
  return falha?.response?.data?.message || padrao;
}
