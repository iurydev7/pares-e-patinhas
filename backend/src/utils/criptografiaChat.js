const crypto = require("crypto");

/**
 * Criptografia das mensagens do chat em repouso (AES-256-GCM).
 *
 * Ativada quando CHAT_CHAVE_CRIPTOGRAFIA está definida (64 caracteres hexadecimais = 32 bytes).
 * Gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * Protege o conteúdo se o banco ou um backup vazar. NÃO protege contra quem tem
 * acesso ao servidor (que conhece a chave). Se a chave for perdida, as mensagens
 * cifradas não podem ser recuperadas.
 */
function obterChave() {
  const hex = process.env.CHAT_CHAVE_CRIPTOGRAFIA;

  if (!hex) return null;

  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(
      "CHAT_CHAVE_CRIPTOGRAFIA inválida: use 64 caracteres hexadecimais (32 bytes)."
    );
  }

  return Buffer.from(hex, "hex");
}

const criptografiaAtiva = () => obterChave() !== null;

// O id da conversa entra como dado autenticado: um texto cifrado copiado
// para outra conversa (adulteração no banco) não é aceito na leitura.
const dadoAutenticado = (matchId) => Buffer.from(`match:${matchId}`, "utf8");

/** Devolve base64( iv[12] | tag[16] | conteúdo cifrado ). */
function cifrar(texto, matchId) {
  const chave = obterChave();

  if (!chave) {
    throw new Error("CHAT_CHAVE_CRIPTOGRAFIA não configurada.");
  }

  const iv = crypto.randomBytes(12);
  const cifra = crypto.createCipheriv("aes-256-gcm", chave, iv);
  cifra.setAAD(dadoAutenticado(matchId));

  const conteudo = Buffer.concat([cifra.update(texto, "utf8"), cifra.final()]);

  return Buffer.concat([iv, cifra.getAuthTag(), conteudo]).toString("base64");
}

/** Devolve o texto original ou `null` se não for possível decifrar (chave ausente/errada ou dado adulterado). */
function decifrar(base64, matchId) {
  try {
    const chave = obterChave();

    if (!chave) return null;

    const dados = Buffer.from(String(base64), "base64");

    if (dados.length < 28) return null;

    const decifra = crypto.createDecipheriv(
      "aes-256-gcm",
      chave,
      dados.subarray(0, 12)
    );
    decifra.setAAD(dadoAutenticado(matchId));
    decifra.setAuthTag(dados.subarray(12, 28));

    return Buffer.concat([
      decifra.update(dados.subarray(28)),
      decifra.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}

module.exports = { criptografiaAtiva, cifrar, decifrar };
