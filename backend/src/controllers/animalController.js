const { Animal } = require('../models');

const cadastrarAnimal = async (req, res) => {
    try {
        const novoAnimal = await Animal.create(req.body);

        return res.status(201).json(novoAnimal);

    } catch (error) {
        return res.status(500).json({
            mensagem: 'Erro ao cadastrar animal',
            erro: error.message,
        });
    }
};

const listarAnimais = async (req, res) => {
    try {
        const animais = await Animal.findAll();

        return res.status(200).json(animais);

    } catch (error) {
        return res.status(500).json({
            mensagem: 'Erro ao listar animais',
            erro: error.message,
        });
    }
};


const buscarAnimalPorId = async (req, res) => {
    try {
        const animal = await Animal.findByPk(req.params.id);

        if (!animal) {
            return res.status(404).json({
                mensagem: 'Animal não encontrado',
            });
        }

        return res.status(200).json(animal);

    } catch (error) {
        return res.status(500).json({
            mensagem: 'Erro ao buscar animal',
            erro: error.message,
        });
    }
};


const atualizarAnimal = async (req, res) => {
    try {
        const [atualizado] = await Animal.update(req.body, {
            where: {
                id: req.params.id,
            },
        });

        if (!atualizado) {
            return res.status(404).json({
                mensagem: 'Animal não encontrado',
            });
        }

        const animal = await Animal.findByPk(req.params.id);

        return res.status(200).json(animal);

    } catch (error) {
        return res.status(500).json({
            mensagem: 'Erro ao atualizar animal',
            erro: error.message,
        });
    }
};


const excluirAnimal = async (req, res) => {
    try {
        const excluido = await Animal.destroy({
            where: {
                id: req.params.id,
            },
        });

        if (!excluido) {
            return res.status(404).json({
                mensagem: 'Animal não encontrado',
            });
        }

        return res.status(200).json({
            mensagem: 'Animal excluído com sucesso',
        });

    } catch (error) {
        return res.status(500).json({
            mensagem: 'Erro ao excluir animal',
            erro: error.message,
        });
    }
};

module.exports = {
  cadastrarAnimal,
  listarAnimais,
  buscarAnimalPorId,
  atualizarAnimal,
  excluirAnimal,
};