const animalRepository = require("../repositories/animalRepository");
const { validarCadastroAnimal } =require("../validators/animalValidator");

async function cadastrarAnimal(tutorId, body) {
    const dados = validarCadastroAnimal(body);

    return animalRepository.criar({...dados, tutorId: Number(tutorId) });
}

module.exports = { cadastrarAnimal };