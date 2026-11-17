const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddlewares");

const { registrar } = require("../controllers/interactionController");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Interações
 *   description: Curtidas, rejeições e verificação de matches entre animais
 */

/**
 * @swagger
 * /api/interactions:
 *   post:
 *     summary: Registrar uma interação entre animais
 *     description: Registra um like ou dislike e verifica se houve match recíproco.
 *     tags: [Interações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - animalOrigemId
 *               - animalAlvoId
 *               - tipo
 *             properties:
 *               animalOrigemId:
 *                 type: integer
 *                 example: 1
 *               animalAlvoId:
 *                 type: integer
 *                 example: 2
 *               tipo:
 *                 type: string
 *                 enum: [like, dislike]
 *                 example: like
 *           example:
 *             animalOrigemId: 1
 *             animalAlvoId: 2
 *             tipo: like
 *     responses:
 *       201:
 *         description: Interação registrada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                 interacao:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     animalOrigemId:
 *                       type: integer
 *                     animalAlvoId:
 *                       type: integer
 *                     tipo:
 *                       type: string
 *                 deuMatch:
 *                   type: boolean
 *                 match:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Dados inválidos ou interação não permitida.
 *       401:
 *         description: Tutor não autenticado.
 *       403:
 *         description: Animal não pertence ao tutor autenticado.
 *       404:
 *         description: Animal não encontrado.
 *       409:
 *         description: Interação duplicada ou animal indisponível.
 *       500:
 *         description: Erro interno do servidor.
 */

router.post("/", authMiddleware, registrar);

module.exports = router;
