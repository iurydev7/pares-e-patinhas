const { Router } = require("express");

const authMiddleware = require("../middlewares/authMiddlewares");
const {
  listarConversas,
  listarMensagens,
  enviarMensagem,
  bloquear,
  desbloquear,
} = require("../controllers/chatController");

const router = Router();

// TODAS as rotas do chat exigem login: o middleware é aplicado ao roteador inteiro.
router.use(authMiddleware);

/**
 * @swagger
 * /api/chat/conversas:
 *   get:
 *     summary: Listar minhas conversas (matches)
 *     tags:
 *       - Chat
 *     description: Retorna os matches do tutor autenticado com a última mensagem e a quantidade de não lidas.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conversas.
 *       401:
 *         description: Autenticação necessária.
 */
router.get("/conversas", listarConversas);

/**
 * @swagger
 * /api/chat/conversas/{matchId}/mensagens:
 *   get:
 *     summary: Listar mensagens de uma conversa
 *     tags:
 *       - Chat
 *     description: Só responde a quem é tutor de um dos dois pets do match. Marca as mensagens recebidas como lidas.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: depoisDe
 *         schema:
 *           type: integer
 *         description: Só mensagens com id maior que este (atualização do chat aberto).
 *       - in: query
 *         name: antesDe
 *         schema:
 *           type: integer
 *         description: Só mensagens com id menor que este (histórico mais antigo).
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 30
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Conversa e mensagens.
 *       400:
 *         description: Parâmetro inválido.
 *       401:
 *         description: Autenticação necessária.
 *       404:
 *         description: Conversa não encontrada (inexistente ou de outras pessoas).
 *   post:
 *     summary: Enviar mensagem
 *     tags:
 *       - Chat
 *     description: O remetente é o tutor do token. Máximo de 1000 caracteres e 20 mensagens por minuto.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - texto
 *             properties:
 *               texto:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Oi! Vamos marcar um passeio com os pets?
 *     responses:
 *       201:
 *         description: Mensagem enviada.
 *       400:
 *         description: Mensagem vazia ou longa demais.
 *       401:
 *         description: Autenticação necessária.
 *       403:
 *         description: Conversa bloqueada.
 *       404:
 *         description: Conversa não encontrada.
 *       429:
 *         description: Muitas mensagens em pouco tempo.
 */
router.get("/conversas/:matchId/mensagens", listarMensagens);
router.post("/conversas/:matchId/mensagens", enviarMensagem);

/**
 * @swagger
 * /api/chat/conversas/{matchId}/bloqueio:
 *   post:
 *     summary: Bloquear o outro tutor da conversa
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Situação do bloqueio.
 *       401:
 *         description: Autenticação necessária.
 *       404:
 *         description: Conversa não encontrada.
 *   delete:
 *     summary: Desfazer o meu bloqueio
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Situação do bloqueio.
 *       401:
 *         description: Autenticação necessária.
 *       404:
 *         description: Conversa não encontrada.
 */
router.post("/conversas/:matchId/bloqueio", bloquear);
router.delete("/conversas/:matchId/bloqueio", desbloquear);

module.exports = router;
