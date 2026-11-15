import pets from "../data/pets";

function chaveFilaFarejar(tutorId, petAtivoId) {
  return `farejar-fila-${tutorId}-${petAtivoId}`;
}

export function lerFilaFarejar(tutorId, petAtivoId) {
  if (!tutorId || !petAtivoId) {
    return [];
  }

  const filaInicial = pets.filter((pet) => String(pet.id) !== "1");

  try {
    const salvo = sessionStorage.getItem(chaveFilaFarejar(tutorId, petAtivoId));

    if (salvo === null) {
      return filaInicial;
    }

    const ids = JSON.parse(salvo);

    if (!Array.isArray(ids)) {
      return filaInicial;
    }

    const petsPorId = new Map(filaInicial.map((pet) => [String(pet.id), pet]));

    return ids.map((id) => petsPorId.get(String(id))).filter(Boolean);
  } catch {
    return filaInicial;
  }
}

export function removerDaFilaFarejar(tutorId, petAtivoId, petId) {
  const fila = lerFilaFarejar(tutorId, petAtivoId);

  const existe = fila.some((pet) => String(pet.id) === String(petId));

  if (!existe) {
    return {
      fila,
      alterou: false,
    };
  }

  const novaFila = fila.filter((pet) => String(pet.id) !== String(petId));

  sessionStorage.setItem(
    chaveFilaFarejar(tutorId, petAtivoId),
    JSON.stringify(novaFila.map((pet) => String(pet.id))),
  );

  return {
    fila: novaFila,
    alterou: true,
  };
}
