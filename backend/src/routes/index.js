const { Router } = require("express");
const loginRoutes = require("./loginRoutes");

const router = Router();

const animalRoutes = require("./animalRoutes");

router.use("/animals", animalRoutes);
router.use("/auth", loginRoutes);

module.exports = router;