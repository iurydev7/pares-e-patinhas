/**
 * Ambiente dos testes de segurança do chat.
 *
 * Os testes exercitam o código REAL de src/ (serviço, controller, middlewares, criptografia),
 * trocando apenas o banco por tabelas em memória. Assim rodam em qualquer máquina, sem MySQL:
 *
 *   node --test tests/chat.seguranca.test.js
 *
 * O banco falso é propositalmente rígido: recusa operadores desconhecidos e tipos errados,
 * registra todas as consultas e só devolve as colunas pedidas em `attributes`.
 */
const path = require("path");
const crypto = require("crypto");
const Module = require("module");

const RAIZ = path.resolve(__dirname, "..", "..");
const DIR_MODELS = path.join(RAIZ, "models");

function tentar(nome) {
  try {
    return require(nome);
  } catch {
    return null;
  }
}

// ---- sequelize: usa o Op real se o pacote estiver instalado ----
const sequelizeReal = tentar("sequelize");
const Op = sequelizeReal
  ? sequelizeReal.Op
  : {
      in: Symbol("in"),
      or: Symbol("or"),
      gt: Symbol("gt"),
      gte: Symbol("gte"),
      lt: Symbol("lt"),
      ne: Symbol("ne"),
    };

// ---- jsonwebtoken: usa o real se instalado; senão, um HS256 mínimo equivalente ----
function criarJwtMinimo() {
  const b64 = (dado) => Buffer.from(dado).toString("base64url");
  const erro = (nome, mensagem) => Object.assign(new Error(mensagem), { name: nome });
  const assinar = (conteudo, segredo) =>
    crypto.createHmac("sha256", segredo).update(conteudo).digest("base64url");

  return {
    sign(payload, segredo, opcoes = {}) {
      const agora = Math.floor(Date.now() / 1000);
      const corpo = { ...payload, iat: agora };
      if (typeof opcoes.expiresIn === "number") corpo.exp = agora + opcoes.expiresIn;
      if (typeof opcoes.expiresIn === "string") corpo.exp = agora + 2 * 60 * 60;
      const conteudo = `${b64(JSON.stringify({ alg: "HS256", typ: "JWT" }))}.${b64(JSON.stringify(corpo))}`;
      return `${conteudo}.${assinar(conteudo, segredo)}`;
    },
    verify(token, segredo, opcoes = {}) {
      const partes = String(token).split(".");
      if (partes.length !== 3) throw erro("JsonWebTokenError", "jwt malformed");
      let cabecalho;
      let corpo;
      try {
        cabecalho = JSON.parse(Buffer.from(partes[0], "base64url").toString());
        corpo = JSON.parse(Buffer.from(partes[1], "base64url").toString());
      } catch {
        throw erro("JsonWebTokenError", "invalid token");
      }
      if (!(opcoes.algorithms || ["HS256"]).includes(cabecalho.alg)) {
        throw erro("JsonWebTokenError", "invalid algorithm");
      }
      const esperado = Buffer.from(assinar(`${partes[0]}.${partes[1]}`, segredo));
      const recebido = Buffer.from(partes[2]);
      if (esperado.length !== recebido.length || !crypto.timingSafeEqual(esperado, recebido)) {
        throw erro("JsonWebTokenError", "invalid signature");
      }
      if (typeof corpo.exp === "number" && corpo.exp <= Math.floor(Date.now() / 1000)) {
        throw erro("TokenExpiredError", "jwt expired");
      }
      return corpo;
    },
  };
}

const jwtReal = tentar("jsonwebtoken");
const jwt = jwtReal || criarJwtMinimo();
const temExpress = tentar("express") !== null;

// ---- banco em memória ----
const consultas = [];

function confere(linha, where = {}) {
  for (const chave of Reflect.ownKeys(where)) {
    const condicao = where[chave];

    if (chave === Op.or) {
      if (!condicao.some((alternativa) => confere(linha, alternativa))) return false;
      continue;
    }

    if (typeof chave !== "string") throw new Error("Operador de topo não suportado no banco falso.");

    const valor = linha[chave];

    if (condicao === null) {
      if (valor !== null && valor !== undefined) return false;
      continue;
    }

    if (typeof condicao === "number" || typeof condicao === "boolean") {
      if (valor !== condicao) return false;
      continue;
    }

    if (typeof condicao !== "object" || Array.isArray(condicao) || condicao instanceof Date) {
      throw new Error(`Tipo inesperado na consulta (${chave}): só números, booleanos, null ou operadores.`);
    }

    for (const operador of Reflect.ownKeys(condicao)) {
      const alvo = condicao[operador];

      if (operador === Op.in) {
        if (!Array.isArray(alvo) || alvo.some((v) => typeof v !== "number")) {
          throw new Error("Op.in só aceita lista de números.");
        }
        if (!alvo.includes(valor)) return false;
      } else if (operador === Op.gt) {
        if (!(valor > alvo)) return false;
      } else if (operador === Op.gte) {
        if (!(valor >= alvo)) return false;
      } else if (operador === Op.lt) {
        if (!(valor < alvo)) return false;
      } else if (operador === Op.ne) {
        if (valor === alvo) return false;
      } else {
        throw new Error("Operador não suportado no banco falso.");
      }
    }
  }

  return true;
}

function criarModelo(nome, { unico } = {}) {
  const linhas = [];
  let sequencia = 0;

  const registrar = (metodo, opcoes) => consultas.push({ modelo: nome, metodo, opcoes: opcoes || {} });

  const projetar = (linha, attributes) => {
    if (!attributes) return { ...linha };
    const copia = {};
    for (const atributo of attributes) copia[atributo] = linha[atributo];
    return copia;
  };

  const buscar = (opcoes = {}) => {
    let encontradas = linhas.filter((linha) => confere(linha, opcoes.where));

    if (opcoes.order) {
      const [[campo, direcao]] = opcoes.order;
      encontradas = encontradas
        .slice()
        .sort((a, b) => (direcao === "DESC" ? b[campo] - a[campo] : a[campo] - b[campo]));
    }

    if (opcoes.limit !== undefined) encontradas = encontradas.slice(0, opcoes.limit);

    return encontradas.map((linha) => projetar(linha, opcoes.attributes));
  };

  return {
    _nome: nome,
    _linhas: linhas,
    _inserir(dados) {
      const linha = { id: dados.id ?? ++sequencia, createdAt: new Date(), updatedAt: new Date(), ...dados };
      sequencia = Math.max(sequencia, linha.id);
      linhas.push(linha);
      return linha;
    },
    async findByPk(id, opcoes = {}) {
      registrar("findByPk", { ...opcoes, id });
      if (typeof id !== "number") throw new Error(`${nome}.findByPk recebeu id que não é número.`);
      const linha = linhas.find((l) => l.id === id);
      return linha ? projetar(linha, opcoes.attributes) : null;
    },
    async findAll(opcoes = {}) {
      registrar("findAll", opcoes);
      return buscar(opcoes);
    },
    async findOne(opcoes = {}) {
      registrar("findOne", opcoes);
      return buscar({ ...opcoes, limit: 1 })[0] || null;
    },
    async count(opcoes = {}) {
      registrar("count", opcoes);
      return buscar(opcoes).length;
    },
    async create(dados, opcoes = {}) {
      registrar("create", opcoes);
      if (unico && linhas.some((l) => unico.every((campo) => l[campo] === dados[campo]))) {
        throw Object.assign(new Error("Validation error"), { name: "SequelizeUniqueConstraintError" });
      }
      return { ...this._inserir({ ...dados }) };
    },
    async update(valores, opcoes = {}) {
      registrar("update", opcoes);
      const alvo = linhas.filter((linha) => confere(linha, opcoes.where));
      alvo.forEach((linha) => Object.assign(linha, valores));
      return [alvo.length];
    },
    async destroy(opcoes = {}) {
      registrar("destroy", opcoes);
      const antes = linhas.length;
      for (let i = linhas.length - 1; i >= 0; i -= 1) {
        if (confere(linhas[i], opcoes.where)) linhas.splice(i, 1);
      }
      return antes - linhas.length;
    },
  };
}

const models = {
  Tutor: criarModelo("Tutor"),
  Animal: criarModelo("Animal"),
  Match: criarModelo("Match"),
  Mensagem: criarModelo("Mensagem"),
  BloqueioChat: criarModelo("BloqueioChat", {
    unico: ["bloqueador_tutor_id", "bloqueado_tutor_id"],
  }),
};

function limparBanco() {
  for (const modelo of Object.values(models)) modelo._linhas.length = 0;
  consultas.length = 0;
}

// ---- troca os módulos ao carregar o código de src/ ----
const carregarOriginal = Module._load;

Module._load = function carregar(pedido, pai, ...resto) {
  if (pedido === "sequelize" && !sequelizeReal) return { Op };
  if (pedido === "jsonwebtoken") return jwt;

  if (pedido.startsWith(".") && pai && pai.filename) {
    const absoluto = path.resolve(path.dirname(pai.filename), pedido);
    if (absoluto === DIR_MODELS || absoluto === path.join(DIR_MODELS, "index.js")) {
      return models;
    }
  }

  return carregarOriginal.call(this, pedido, pai, ...resto);
};

process.env.JWT_SECRET = "segredo-apenas-para-testes";
process.env.NODE_ENV = "test";

/** Resposta falsa do Express para testar middlewares e controllers sem servidor. */
function criarResposta() {
  const resposta = {
    statusCode: 200,
    cabecalhos: {},
    corpo: undefined,
    set(nome, valor) {
      this.cabecalhos[nome.toLowerCase()] = valor;
      return this;
    },
    status(codigo) {
      this.statusCode = codigo;
      return this;
    },
    json(corpo) {
      this.corpo = corpo;
      return this;
    },
  };

  return resposta;
}

module.exports = {
  RAIZ,
  Op,
  jwt,
  models,
  consultas,
  limparBanco,
  criarResposta,
  temExpress,
  usandoJwtReal: jwtReal !== null,
};
