const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddlewares");
const { listar } = require("../controllers/matchController");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Listagem de conexões recíprocas entre animais
 */

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Listar os matches de um animal
 *     description: Retorna os matches de um animal pertencente ao tutor autenticado.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: animalId
 *         required: true
 *         description: ID do animal que terá seus matches consultados.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: Matches encontrados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 1
 *                 matches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       animal:
 *                         type: object
 *                         description: Dados públicos do animal correspondente.
 *                       criadoEm:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: ID do animal inválido.
 *       401:
 *         description: Autenticação necessária.
 *       403:
 *         description: Animal não pertence ao tutor autenticado.
 *       404:
 *         description: Animal não encontrado.
 *       409:
 *         description: Animal desativado.
 *       500:
 *         description: Erro interno do servidor.
 */

router.get("/", authMiddleware, listar);

module.exports = router;
