import petsDemo from "../data/petsDemo.json";

const TUTOR_DEMONSTRACAO_ID = "1";

export function chavePets(tutorId) {
  return `pets-${tutorId}`;
}

export function chavePetAtivo(tutorId) {
  return `pet-ativo-${tutorId}`;
}

function chaveMigracaoFotos(tutorId) {
  return `fotos-demo-v2-${tutorId}`;
}

function chaveLimpezaDemonstracao(tutorId) {
  return `limpeza-pets-demo-v1-${tutorId}`;
}

function copiarPetsDemo() {
  return petsDemo.map((pet) => ({
    ...pet,
    fotos: Array.isArray(pet.fotos) ? [...pet.fotos] : [],
  }));
}

function ehCopiaDemonstracao(pet) {
  if (!pet || typeof pet !== "object") {
    return false;
  }

  const modelo = petsDemo.find((item) => String(item.id) === String(pet.id));

  if (!modelo) {
    return false;
  }

  const camposModelo = Object.keys(modelo).filter(
    (campo) => campo !== "foto" && campo !== "fotos",
  );

  const camposPet = Object.keys(pet).filter(
    (campo) => campo !== "foto" && campo !== "fotos",
  );

  if (camposPet.length !== camposModelo.length) {
    return false;
  }

  const dadosIguais = camposModelo.every(
    (campo) =>
      Object.hasOwn(pet, campo) &&
      JSON.stringify(pet[campo]) === JSON.stringify(modelo[campo]),
  );

  if (!dadosIguais) {
    return false;
  }

  const fotoAntiga = modelo.foto.replace(/\.[^/.]+$/, ".png");

  const fotoDeDemonstracao =
    pet.foto === modelo.foto || pet.foto === fotoAntiga;

  const fotosAtuais = JSON.stringify(pet.fotos ?? []);

  const fotosNovas = JSON.stringify(modelo.fotos ?? []);

  const fotosAntigas = JSON.stringify([fotoAntiga]);

  const galeriaDeDemonstracao =
    fotosAtuais === fotosNovas || fotosAtuais === fotosAntigas;

  return fotoDeDemonstracao && galeriaDeDemonstracao;
}

function prepararPets(tutorId) {
  const chave = chavePets(tutorId);
  const conteudo = localStorage.getItem(chave);

  const ehTutorDemonstracao = String(tutorId) === TUTOR_DEMONSTRACAO_ID;

  if (conteudo === null) {
    const listaInicial = ehTutorDemonstracao ? copiarPetsDemo() : [];

    localStorage.setItem(chave, JSON.stringify(listaInicial));

    if (ehTutorDemonstracao) {
      localStorage.setItem(chaveMigracaoFotos(tutorId), "1");
    } else {
      localStorage.setItem(chaveLimpezaDemonstracao(tutorId), "1");
    }

    return listaInicial;
  }

  const dados = JSON.parse(conteudo);

  let pets = Array.isArray(dados) ? dados : [];

  if (!ehTutorDemonstracao) {
    const chaveLimpeza = chaveLimpezaDemonstracao(tutorId);

    if (localStorage.getItem(chaveLimpeza) !== "1") {
      const petsFiltrados = pets.filter((pet) => !ehCopiaDemonstracao(pet));

      if (petsFiltrados.length !== pets.length) {
        localStorage.setItem(chave, JSON.stringify(petsFiltrados));

        const idAtivo = localStorage.getItem(chavePetAtivo(tutorId));

        if (
          idAtivo !== null &&
          !petsFiltrados.some((pet) => String(pet.id) === idAtivo)
        ) {
          localStorage.removeItem(chavePetAtivo(tutorId));
        }

        pets = petsFiltrados;
      }

      localStorage.setItem(chaveLimpeza, "1");
    }

    return pets;
  }

  if (localStorage.getItem(chaveMigracaoFotos(tutorId)) === "1") {
    return pets;
  }

  const demonstracaoPorId = new Map(
    petsDemo.map((pet) => [String(pet.id), pet]),
  );

  let houveAlteracao = false;

  const petsAtualizados = pets.map((pet) => {
    const demonstracao = demonstracaoPorId.get(String(pet.id));

    if (!demonstracao) {
      return pet;
    }

    houveAlteracao = true;

    return {
      ...pet,
      foto: demonstracao.foto,
      fotos: Array.isArray(demonstracao.fotos) ? [...demonstracao.fotos] : [],
    };
  });

  if (houveAlteracao) {
    localStorage.setItem(chave, JSON.stringify(petsAtualizados));
  }

  localStorage.setItem(chaveMigracaoFotos(tutorId), "1");

  return petsAtualizados;
}

export function lerEstadoPet(tutorId) {
  if (!tutorId) {
    return {
      pets: [],
      petAtivoId: null,
    };
  }

  try {
    const pets = prepararPets(tutorId);

    const idSalvo = localStorage.getItem(chavePetAtivo(tutorId));

    const petAtivoId =
      idSalvo !== null && pets.some((pet) => String(pet.id) === idSalvo)
        ? idSalvo
        : null;

    return {
      pets,
      petAtivoId,
    };
  } catch {
    return {
      pets: [],
      petAtivoId: null,
    };
  }
}

export function gravarPets(tutorId, pets) {
  if (!tutorId) {
    throw new Error("Entre na sua conta para cadastrar um pet.");
  }

  localStorage.setItem(chavePets(tutorId), JSON.stringify(pets));
}

export function gravarPetAtivo(tutorId, petId) {
  if (!tutorId) {
    throw new Error("Entre na sua conta para selecionar um pet.");
  }

  if (petId === null || petId === undefined || petId === "") {
    localStorage.removeItem(chavePetAtivo(tutorId));
    return;
  }

  localStorage.setItem(chavePetAtivo(tutorId), String(petId));
}
