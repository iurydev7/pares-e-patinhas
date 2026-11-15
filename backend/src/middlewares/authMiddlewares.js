const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {

  const authorization = req.headers.authorization;


  const match =
    typeof authorization === "string"
      ? authorization.match(/^Bearer\s+(\S+)$/i)
      : null;

  if (!match) {
    return res.status(401).json({
      success: false,
      message: "Autenticação necessária.",
    });
  }

 
  if (!process.env.JWT_SECRET) {
    return next(new Error("JWT_SECRET não configurado."));
  }

  try {
  
    const decoded = jwt.verify(
      match[1],
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    if (
      typeof decoded !== "object" ||
      typeof decoded.sub !== "string" ||
      !/^[1-9]\d*$/.test(decoded.sub)
    ) {
      return res.status(401).json({
        success: false,
        message: "Token inválido.",
      });
    }

    req.auth = {
      tutorId: decoded.sub,
    };

  
    return next();

  } catch (error) {

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Sessão inválida ou expirada. Faça login novamente.",
      });
    }

    return next(error);
  }
}

module.exports = authMiddleware;