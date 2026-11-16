
const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddlewares");

const router = Router();

const {
  cadastrarAnimal,
  listarAnimais,
  buscarAnimalPorId,
  atualizarAnimal,
  excluirAnimal,
} = require("../controllers/animalController");

/**
 * @swagger
 * tags:
 *   name: Animais
 *   description: Gerenciamento de animais
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Animal:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 60001
 *         nome:
 *           type: string
 *           maxLength: 120
 *           example: Rex
 *         especie:
 *           type: string
 *           maxLength: 50
 *           example: Cachorro
 *         sexo:
 *           type: string
 *           maxLength: 20
 *           example: Macho
 *         raca:
 *           type: string
 *           nullable: true
 *           maxLength: 100
 *           example: Golden Retriever
 *         idadeAnos:
 *           type: integer
 *           example: 2
 *         idadeMeses:
 *           type: integer
 *           example: 3
 *         porte:
 *           type: string
 *           maxLength: 30
 *           example: Grande
 *         descricao:
 *           type: string
 *           nullable: true
 *           example: Cachorro dócil e brincalhão.
 *         cidade:
 *           type: string
 *           nullable: true
 *           example: Fortaleza
 *         estado:
 *           type: string
 *           nullable: true
 *           maxLength: 2
 *           example: CE
 *         tutorId:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - nome
 *         - especie
 *         - sexo
 *         - idadeAnos
 *         - idadeMeses
 *         - porte
 *         - tutorId
 *
 *     AnimalInput:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           example: Rex
 *         especie:
 *           type: string
 *           example: Cachorro
 *         sexo:
 *           type: string
 *           example: Macho
 *         raca:
 *           type: string
 *           nullable: true
 *           example: Golden Retriever
 *         idadeAnos:
 *           type: integer
 *           example: 2
 *         idadeMeses:
 *           type: integer
 *           example: 3
 *         porte:
 *           type: string
 *           example: Grande
 *         descricao:
 *           type: string
 *           nullable: true
 *           example: Cachorro dócil e brincalhão.
 *         cidade:
 *           type: string
 *           nullable: true
 *           example: Fortaleza
 *         estado:
 *           type: string
 *           nullable: true
 *           example: CE
 *         tutorId:
 *           type: integer
 *           example: 1
 *       required:
 *         - nome
 *         - especie
 *         - sexo
 *         - idadeAnos
 *         - idadeMeses
 *         - porte
 *         - tutorId
 *
 *     AnimalUpdate:
 *       type: object
 *       description: Campos enviados para atualização do animal.
 *       properties:
 *         nome:
 *           type: string
 *           example: Mel
 *         especie:
 *           type: string
 *           example: Gato
 *         sexo:
 *           type: string
 *           example: Fêmea
 *         raca:
 *           type: string
 *           nullable: true
 *           example: Siamês
 *         idadeAnos:
 *           type: integer
 *           example: 2
 *         idadeMeses:
 *           type: integer
 *           example: 0
 *         porte:
 *           type: string
 *           example: Pequeno
 *         descricao:
 *           type: string
 *           nullable: true
 *           example: Gatinha carinhosa e tranquila.
 *         cidade:
 *           type: string
 *           nullable: true
 *           example: Maracanaú
 *         estado:
 *           type: string
 *           nullable: true
 *           example: CE
 *         tutorId:
 *           type: integer
 *           example: 1
 */

/**
 * @swagger
 * /api/animals:
 *   post:
 *     summary: Cadastrar um animal
 *     tags: [Animais]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnimalInput'
 *           example:
 *             nome: Rex
 *             especie: Cachorro
 *             sexo: Macho
 *             raca: Golden Retriever
 *             idadeAnos: 2
 *             idadeMeses: 3
 *             porte: Grande
 *             descricao: Cachorro dócil e brincalhão.
 *             cidade: Fortaleza
 *             estado: CE
 *             tutorId: 1
 *     responses:
 *       201:
 *         description: Animal cadastrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Animal'
 *       500:
 *         description: Erro ao cadastrar animal.
 */
router.post("/", authMiddleware, cadastrarAnimal);

/**
 * @swagger
 * /api/animals:
 *   get:
 *     summary: Listar animais
 *     tags: [Animais]
 *     parameters:
 *       - in: query
 *         name: especie
 *         schema:
 *           type: string
 *         description: Filtrar animais por espécie.
 *       - in: query
 *         name: raca
 *         schema:
 *           type: string
 *         description: Filtrar animais por raça.
 *       - in: query
 *         name: cidade
 *         schema:
 *           type: string
 *         description: Filtrar animais por cidade.
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Filtrar animais por estado.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Número da página.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Quantidade de animais por página.
 *     responses:
 *       200:
 *         description: Lista de animais retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 4
 *                 pagina:
 *                   type: integer
 *                   example: 1
 *                 limite:
 *                   type: integer
 *                   example: 10
 *                 totalPaginas:
 *                   type: integer
 *                   example: 1
 *                 animais:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Animal'
 *       500:
 *         description: Erro ao listar animais.
 */
router.get("/", listarAnimais);

/**
 * @swagger
 * /api/animals/{id}:
 *   get:
 *     summary: Buscar animal pelo ID
 *     tags: [Animais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do animal.
 *     responses:
 *       200:
 *         description: Animal encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Animal'
 *       404:
 *         description: Animal não encontrado.
 *       500:
 *         description: Erro ao buscar animal.
 */
router.get("/:id", buscarAnimalPorId);

/**
 * @swagger
 * /api/animals/{id}:
 *   put:
 *     summary: Atualizar um animal
 *     tags: [Animais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do animal.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnimalUpdate'
 *           example:
 *             idadeAnos: 2
 *             idadeMeses: 0
 *             cidade: Maracanaú
 *     responses:
 *       200:
 *         description: Animal atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Animal'
 *       404:
 *         description: Animal não encontrado.
 *       500:
 *         description: Erro ao atualizar animal.
 */
router.put("/:id", authMiddleware, atualizarAnimal);

/**
 * @swagger
 * /api/animals/{id}:
 *   delete:
 *     summary: Excluir um animal
 *     tags: [Animais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do animal.
 *     responses:
 *       200:
 *         description: Animal excluído com sucesso.
 *         content:
 *           application/json:
 *             example:
 *               mensagem: Animal excluído com sucesso
 *       404:
 *         description: Animal não encontrado.
 *       500:
 *         description: Erro ao excluir animal.
 */
router.delete("/:id", authMiddleware, excluirAnimal);

module.exports = router;
