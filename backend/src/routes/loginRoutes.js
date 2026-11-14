const { Router } = require("express");

const { login } = require("../controllers/loginController");
const { me } = require("../controllers/meController");

const authMiddleware = require("../middlewares/authMiddlewares");

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autenticar tutor
 *     tags:
 *       - Autenticação
 *     description: Valida e-mail e senha e retorna um token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: tutor@email.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *       400:
 *         description: E-mail e senha obrigatórios.
 *       401:
 *         description: Credenciais inválidas.
 */
router.post("/login", login);
router.post("/login", login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Consultar tutor autenticado
 *     description: Retorna os dados do tutor identificado pelo JWT.
 *     tags:
 *       - Autenticação
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Tutor autenticado encontrado.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               tutor:
 *                 id: 1
 *                 nome: Tutor Exemplo
 *                 email: tutor@email.com
 *                 cidade: Fortaleza
 *                 estado: CE
 *
 *       401:
 *         description: Token ausente, inválido, expirado ou tutor inexistente.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Autenticação necessária.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.get("/me", authMiddleware, me);
router.get("/me", authMiddleware, me);

module.exports = router;