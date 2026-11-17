import api from "./api";

function capitalizar(valor) {
  const texto = String(valor || "").trim();
  return texto ? texto[0].toLocaleUpperCase("pt-BR") + texto.slice(1) : "";
}

export function mapearPetFarejar(animal) {
  const fotos = Array.isArray(animal.fotos)
    ? animal.fotos
        .map((foto) => (typeof foto === "string" ? foto : foto?.url))
        .filter((foto) => typeof foto === "string" && foto.trim())
    : [];
  const foto = animal.foto || fotos[0] || "";
  const sexoNormalizado = String(animal.sexo || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return {
    ...animal,
    especie: capitalizar(animal.especie),
    sexo:
      sexoNormalizado === "femea"
        ? "Fêmea"
        : sexoNormalizado === "macho"
          ? "Macho"
          : capitalizar(animal.sexo),
    raca: animal.raca || "",
    idade: Number(animal.idadeAnos) || 0,
    cidade: animal.cidade || "",
    estado: animal.estado || "",
    imagem: foto,
    fotos: foto && !fotos.includes(foto) ? [foto, ...fotos] : fotos,
  };
}

export async function buscarPetsDisponiveis(animalId) {
  const { data } = await api.get("/discover", {
    params: { animalId, page: 1, limit: 100 },
  });

  if (!Array.isArray(data?.animais)) {
    throw new Error("A resposta da lista de pets para farejar é inválida.");
  }

  return {
    ...data,
    animais: data.animais.map(mapearPetFarejar),
  };
}

export async function buscarPetPorId(petId) {
  const { data } = await api.get(`/animals/${encodeURIComponent(petId)}`);

  if (!data || data.id == null) {
    throw new Error("Pet não encontrado.");
  }

  return mapearPetFarejar(data);
}

export async function registrarInteracao(animalOrigemId, animalAlvoId, tipo) {
  const { data } = await api.post("/interactions", {
    animalOrigemId,
    animalAlvoId,
    tipo,
  });

  return data;
}

export function mensagemDeErro(falha, padrao) {
  return (
    falha?.response?.data?.message ||
    falha?.response?.data?.mensagem ||
    falha?.message ||
    padrao
  );
}
