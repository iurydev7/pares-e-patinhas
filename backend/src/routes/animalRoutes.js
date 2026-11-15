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

router.post("/", authMiddleware, cadastrarAnimal);

router.get("/", listarAnimais);

router.get("/:id", buscarAnimalPorId);

router.put("/:id", authMiddleware, atualizarAnimal);

router.delete("/:id", excluirAnimal);

module.exports = router;