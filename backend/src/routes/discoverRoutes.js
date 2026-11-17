const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddlewares");
const { listar } = require("../controllers/farejarController");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Farejar
 *   description: Descoberta de animais para novas conexões
 */

/**
 * @swagger
 * /api/discover:
 *   get:
 *     summary: Buscar animais disponíveis para o Farejar
 *     tags: [Farejar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: animalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do animal selecionado pelo tutor.
 *       - in: query
 *         name: especie
 *         schema:
 *           type: string
 *         description: Deve corresponder à espécie do animal selecionado.
 *       - in: query
 *         name: sexo
 *         schema:
 *           type: string
 *           enum: [macho, femea, todos]
 *         description: Filtrar por sexo.
 *       - in: query
 *         name: cidade
 *         schema:
 *           type: string
 *         description: Filtrar por cidade.
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Filtrar por estado.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Animais elegíveis retornados com sucesso.
 *       400:
 *         description: Filtros inválidos.
 *       401:
 *         description: Autenticação necessária.
 *       403:
 *         description: Animal não pertence ao tutor autenticado.
 *       404:
 *         description: Animal selecionado não encontrado.
 */

router.get("/", authMiddleware, listar);

module.exports = router;
