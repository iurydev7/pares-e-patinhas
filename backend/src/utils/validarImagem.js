const erroHttp = require("./erroHttp");

const TAMANHO_MAXIMO_IMAGEM = 1.5 * 1024 * 1024;
const DATA_URL_IMAGEM =
  /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

function assinaturaValida(tipo, bytes) {
  if (tipo === "jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (tipo === "png") {
    return (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  return (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  );
}

function validarDataUrlImagem(imagem) {
  if (typeof imagem !== "string") {
    throw erroHttp("A imagem enviada é inválida.", 400);
  }

  const correspondencia = DATA_URL_IMAGEM.exec(imagem);

  if (!correspondencia) {
    throw erroHttp("Envie uma imagem JPG, PNG ou WebP válida.", 400);
  }

  const [, tipo, base64] = correspondencia;
  const bytes = Buffer.from(base64, "base64");

  if (
    base64.length % 4 === 1 ||
    bytes.length === 0 ||
    !assinaturaValida(tipo, bytes)
  ) {
    throw erroHttp("Envie uma imagem JPG, PNG ou WebP válida.", 400);
  }

  if (bytes.length > TAMANHO_MAXIMO_IMAGEM) {
    throw erroHttp("Cada imagem deve ter no máximo 1,5 MB após o processamento.", 400);
  }

  return imagem;
}

function validarListaImagens(imagens) {
  if (!Array.isArray(imagens) || imagens.length > 5) {
    throw erroHttp("Envie uma lista com no máximo 5 imagens.", 400);
  }

  return imagens.map(validarDataUrlImagem);
}

module.exports = {
  validarDataUrlImagem,
  validarListaImagens,
};
