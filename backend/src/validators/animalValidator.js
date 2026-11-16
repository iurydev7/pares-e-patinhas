const erroHttp = require("../utils/erroHttp");

const ESPECIES = ["cachorro", "gato", "outro"];
const SEXOS = ["macho", "femea"];
const PORTES = ["pequeno", "medio", "grande"];
const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

function normalizar(valor) {
    if (typeof valor !== "string") return"";
    return valor.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function vazio(valor) {
    return valor === undefined || valor === null || valor === "";
}

function parInteiro(valor) {
    if (typeof valor === "number") return Number.isInteger(valor) ? valor : NaN;
    if (typeof valor === "string" && /^\d+$/.test(valor.trim())) return Number(valor.trim());
    return NaN;
}

function validarCadastroAnimal(body) {
    const dados = body && typeof body === "object" ? body:{};
    const erros = [];

    const nome = typeof dados.nome === "string" ? dados.nome.trim():"";
    if (!nome) erros.push("Nome é obrigatório!");
    else if (nome.legth > 120) erros.push("Nome deve conter até 120 caracteres");

    const especie = normalizar(dados.especie);
    if(!especie) erros.push("Especie ´s obrigatória!");
    else if (!ESPECIES.includes(especie)) erros.push(`Especies inválida (use: ${ESPECIES.join(", ")})`);

    const sexo = normalizar(dados.sexo);
    if (!sexo) erros.push("Sexo é obrigatório!");
    else if (!ESPECIES.includes(especie)) erros.push (`sexo inválido (use: ${SEXOS.join(", ")})`);

    const porte = normalizar(dados.porte);
    if (!porte) erros.push("Porte é obrigatório!");
    else if (!PORTES.includes(porte)) erros.push (`porte inválido (use: ${PORTES.join(", ")})`);

    let idadeAnos = 0;
    if (vazio(dados.idadeAnos)) {
        erros.push("IdadeAnos é obrigatória!");
    } else {
        idadeAnos = parInteiro(dados.idadeAnos);
        if (Number.isNaN(idadeAnos) || idadeAnos < 0 || idadeAnos > 40) {
            erros.push("IdadeAnos deve estar entre 0 e 40");
        }
    }

    let idadeMeses = 0;
    if (!vazio(dados.idadeMeses)) {
        idadeMeses = parInteiro(dados.idadeMeses);
    if (Number.isNaN(idadeMeses) || idadeMeses < 0 || idadeMeses > 11) {
        erros.push("idadeMeses deve ser um número inteiro entre 0 e 11");
        }
    }

    let raca= null
    if (!vazio(dados.raca)) {
        if (typeof dados.raca !== "string") erros.push("Raça deve ser um texto!");
         else if (dados.raca.trim().length > 100) erros.push("raca deve ter até 100 caracteres");
         else raca = dados.raca.trim() || null;
     }

    let descricao = null;
    if (!vazio(dados.descricao)) {
        if (typeof dados.descricao !== "string") erros.push("descricao deve ser um texto");
         else if (dados.descricao.trim().length > 1000) erros.push("descricao deve ter até 1000 caracteres");
         else descricao = dados.descricao.trim() || null;
    }

    const cidade = typeof dados.cidade === "string" ? dados.cidade.trim() : "";
    if (!cidade) erros.push("cidade é obrigatória");
    else if (cidade.length > 100) erros.push("cidade deve ter até 100 caracteres");

    const estado = typeof dados.estado === "string" ? dados.estado.trim().toUpperCase() : "";
    if (!estado) erros.push("estado é obrigatório");
    else if (!UFS.includes(estado)) erros.push("estado deve ser uma sigla de UF válida (ex.: CE)");

    if (erros.length > 0) {
    throw erroHttp(`Dados inválidos: ${erros.join("; ")}.`, 400);
    }

     return { nome, especie, sexo, raca, idadeAnos, idadeMeses, porte, descricao, cidade, estado };
}

module.exports = { validarCadastroAnimal };