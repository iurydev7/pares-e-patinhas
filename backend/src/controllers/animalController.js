const { Animal, FotoAnimal, sequelize } = require("../../models");
const { validarListaImagens } = require("../utils/validarImagem");

const incluirFotos = {
    model: FotoAnimal,
    as: "fotos",
    attributes: ["url", "ordem"],
};

function serializarAnimal(animal) {
    const dados = animal.toJSON();
    const fotos = (dados.fotos || [])
        .slice()
        .sort((a, b) => a.ordem - b.ordem)
        .map((foto) => foto.url);

    return {
        ...dados,
        fotos,
        foto: fotos[0] || "",
    };
}

async function salvarFotosAnimal(animalId, fotos, transaction) {
    if (fotos === undefined) return;

    await FotoAnimal.destroy({
        where: { animal_id: animalId },
        transaction,
    });

    if (fotos.length > 0) {
        await FotoAnimal.bulkCreate(
            fotos.map((url, ordem) => ({ animal_id: animalId, url, ordem })),
            { transaction },
        );
    }
}

const cadastrarAnimal = async (req, res, next) => {
    try {
        const {
            nome,
            especie,
            sexo,
            raca,
            idadeAnos,
            idadeMeses,
            porte,
            descricao,
            cidade,
            estado,
        } = req.body;

        const fotos = validarListaImagens(req.body.fotos ?? []);
        const novoAnimal = await sequelize.transaction(async (transaction) => {
            const animal = await Animal.create({
                nome,
                especie,
                sexo,
                raca,
                idadeAnos,
                idadeMeses,
                porte,
                descricao,
                cidade,
                estado,
                tutorId: req.auth.tutorId,
            }, { transaction });

            await salvarFotosAnimal(animal.id, fotos, transaction);

            return Animal.findByPk(animal.id, {
                include: [incluirFotos],
                transaction,
            });
        });

        return res.status(201).json(serializarAnimal(novoAnimal));

    } catch (erro) {
        return next(erro);
    }
};

const listarAnimaisDoTutor = async (req, res, next) => {
    try {
        const animais = await Animal.findAll({
            where: { tutorId: req.auth.tutorId },
            include: [incluirFotos],
            order: [['createdAt', 'DESC']],
        });

        res.set('Cache-Control', 'no-store');

        return res.status(200).json({
            animais: animais.map(serializarAnimal),
        });
    } catch (error) {
        return next(error);
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


const atualizarAnimal = async (req, res, next) => {
    try {
        const {
            nome,
            especie,
            sexo,
            raca,
            idadeAnos,
            idadeMeses,
            porte,
            descricao,
            cidade,
            estado,
        } = req.body;

        const fotos =
            req.body?.fotos === undefined
                ? undefined
                : validarListaImagens(req.body.fotos);
        const animal = await sequelize.transaction(async (transaction) => {
            const [atualizado] = await Animal.update({
                nome,
                especie,
                sexo,
                raca,
                idadeAnos,
                idadeMeses,
                porte,
                descricao,
                cidade,
                estado,
            }, {
                where: {
                    id: req.params.id,
                    tutorId: req.auth.tutorId,
                },
                transaction,
            });

            if (!atualizado) return null;

            await salvarFotosAnimal(req.params.id, fotos, transaction);

            return Animal.findOne({
                where: {
                    id: req.params.id,
                    tutorId: req.auth.tutorId,
                },
                include: [incluirFotos],
                transaction,
            });
        });

        if (!animal) {
            return res.status(404).json({
                mensagem: 'Animal não encontrado',
            });
        }

        return res.status(200).json(serializarAnimal(animal));

    } catch (error) {
        return next(error);
    }
};


const excluirAnimal = async (req, res) => {
    try {
        const excluido = await Animal.destroy({
            where: {
                id: req.params.id,
                tutorId: req.auth.tutorId,
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
  listarAnimaisDoTutor,
  listarAnimais,
  buscarAnimalPorId,
  atualizarAnimal,
  excluirAnimal,
};