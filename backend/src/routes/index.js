const { Router } = require("express");

const loginRoutes = require("./loginRoutes");
const animalRoutes = require("./animalRoutes");
const discoverRoutes = require("./discoverRoutes");
const interactionRoutes = require("./interactionRoutes");
const matchRoutes = require("./matchRoutes");

const router = Router();

router.use("/animals", animalRoutes);
router.use("/auth", loginRoutes);
router.use("/discover", discoverRoutes);
router.use("/interactions", interactionRoutes);
router.use("/matches", matchRoutes);

module.exports = router;
