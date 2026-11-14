const { Router } = require("express");

const router = Router();

const animalRoutes = require("./animalRoutes");

router.use("/animals", animalRoutes);

module.exports = router;