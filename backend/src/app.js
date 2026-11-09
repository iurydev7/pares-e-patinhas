const notFoundMiddleware = require("./middlewares/notFoundMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");
const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "API Pares & Patinhas funcionando!",
  });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;