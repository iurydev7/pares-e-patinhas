const { Router } = require("express");

const { login } = require("../controllers/loginController");
const { me } = require("../controllers/meController");
const { register } = require("../controllers/registerController");
const {
  verifyEmail,
  resendCode,
} = require("../controllers/verificacaoController");

const authMiddleware = require("../middlewares/authMiddlewares");

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Cadastrar novo tutor
 *     tags:
 *       - Autenticação
 *     description: >
 *       Cria um tutor ainda NÃO verificado e envia um código de 6 dígitos para o e-mail informado.
 *       O token JWT só é entregue depois da confirmação em /api/auth/verify-email.
 *       A senha deve ter pelo menos 8 caracteres, com maiúscula, minúscula, número e caractere especial.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Tutor Teste
 *               email:
 *                 type: string
 *                 format: email
 *                 example: tutor.teste002@example.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: Teste@12345
 *     responses:
 *       201:
 *         description: Cadastro criado e código enviado por e-mail (verificacaoPendente = true).
 *       400:
 *         description: Dados inválidos, obrigatórios ausentes ou senha fraca.
 *       409:
 *         description: E-mail já cadastrado.
 *       429:
 *         description: Aguarde 60 segundos para pedir um novo código.
 *       502:
 *         description: Falha ao enviar o e-mail de verificação.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post("/register", register);
/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Confirmar e-mail com o código recebido
 *     tags:
 *       - Autenticação
 *     description: Código de 6 dígitos, válido por 15 minutos e com no máximo 5 tentativas. Ao confirmar, retorna o token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - codigo
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: tutor.teste002@example.com
 *               codigo:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: E-mail confirmado. Retorna JWT e tutor.
 *       400:
 *         description: Código inválido ou expirado, ou dados inválidos.
 *       429:
 *         description: Muitas tentativas. Peça um novo código.
 */
router.post("/verify-email", verifyEmail);
/**
 * @swagger
 * /api/auth/resend-code:
 *   post:
 *     summary: Reenviar o código de verificação
 *     tags:
 *       - Autenticação
 *     description: Gera um novo código (o anterior deixa de valer). Só é permitido um envio a cada 60 segundos por e-mail.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: tutor.teste002@example.com
 *     responses:
 *       200:
 *         description: Resposta genérica (não revela se o e-mail tem cadastro).
 *       400:
 *         description: E-mail inválido.
 *       429:
 *         description: Aguarde 60 segundos para pedir um novo código.
 *       502:
 *         description: Falha ao enviar o e-mail de verificação.
 */
router.post("/resend-code", resendCode);
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
 *       403:
 *         description: Senha correta, mas o e-mail ainda não foi confirmado (code EMAIL_NAO_VERIFICADO).
 */
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


module.exports = router;