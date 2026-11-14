const { Router } = require("express");

const router = Router();

const {
  cadastrarAnimal,
  listarAnimais,
  buscarAnimalPorId,
  atualizarAnimal,
  excluirAnimal,
} = require("../controllers/animalController");

router.post("/", cadastrarAnimal);

router.get("/", listarAnimais);

router.get("/:id", buscarAnimalPorId);

router.put("/:id", atualizarAnimal);

router.delete("/:id", excluirAnimal);

module.exports = router;