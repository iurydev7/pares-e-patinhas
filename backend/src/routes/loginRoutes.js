const { Router } = require("express");

const { login } = require("../controllers/loginController");
const { me } = require("../controllers/meController");

const authMiddleware = require("../middlewares/authMiddlewares");

const router = Router();

// Rota pública
router.post("/login", login);

// Rota protegida
router.get("/me", authMiddleware, me);

module.exports = router;