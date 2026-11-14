const { Animal } = require('../../models');

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
        const {
            especie,
            raca,
            cidade,
            estado,
            page = 1,
            limit = 10,
        } = req.query;

        const filtros = {};

        if (especie) filtros.especie = especie;
        if (raca) filtros.raca = raca;
        if (cidade) filtros.cidade = cidade;
        if (estado) filtros.estado = estado;

        const pagina = Math.max(1, parseInt(page, 10) || 1);
        const limite = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

        const offset = (pagina - 1) * limite;

        const { count, rows } = await Animal.findAndCountAll({
            where: filtros,
            limit: limite,
            offset: offset,
            order: [['createdAt', 'DESC']],
        });

        return res.status(200).json({
            total: count,
            pagina: pagina,
            limite: limite,
            totalPaginas: Math.ceil(count / limite),
            animais: rows,
        });

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