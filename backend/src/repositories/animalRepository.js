const { Animal } = require("../../models")

async function criar(dados) {
    return Animal.create(dados);
}

async function buscarPorId(id) {
    return Animal.findByPk(id);
}

module.exports = { criar, buscarPorId };