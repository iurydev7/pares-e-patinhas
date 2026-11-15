import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "./useAuth";
import { PetAtivoContext } from "./PetAtivoContext";

import {
  chavePets,
  chavePetAtivo,
  gravarPetAtivo,
  gravarPets,
  lerEstadoPet,
} from "../services/petStorage";

function SessaoPetAtivo({ children, tutorId }) {
  const [estado, setEstado] = useState(() => lerEstadoPet(tutorId));

  useEffect(() => {
    if (!tutorId) return;

    function sincronizar(evento) {
      if (
        evento.type === "focus" ||
        evento.key === null ||
        evento.key === chavePets(tutorId) ||
        evento.key === chavePetAtivo(tutorId)
      ) {
        setEstado(lerEstadoPet(tutorId));
      }
    }

    window.addEventListener("storage", sincronizar);
    window.addEventListener("focus", sincronizar);

    return () => {
      window.removeEventListener("storage", sincronizar);
      window.removeEventListener("focus", sincronizar);
    };
  }, [tutorId]);

  const adicionarPet = useCallback(
    (dados) => {
      if (!tutorId) {
        throw new Error("Faça login para cadastrar um pet.");
      }

      const anterior = lerEstadoPet(tutorId);

      const novoPet = {
        ...dados,
        id: crypto.randomUUID(),
      };

      const lista = [...anterior.pets, novoPet];

      gravarPets(tutorId, lista);

      setEstado({
        pets: lista,
        petAtivoId: anterior.petAtivoId,
      });

      return novoPet;
    },
    [tutorId],
  );

  const selecionarPet = useCallback(
    (petId) => {
      if (!tutorId) {
        throw new Error("Faça login para selecionar um pet.");
      }

      const anterior = lerEstadoPet(tutorId);

      const escolhido = anterior.pets.find(
        (pet) => String(pet.id) === String(petId),
      );

      if (!escolhido) {
        throw new Error("Pet não encontrado.");
      }

      gravarPetAtivo(tutorId, escolhido.id);

      setEstado({
        pets: anterior.pets,
        petAtivoId: String(escolhido.id),
      });
    },
    [tutorId],
  );

  const desselecionarPet = useCallback(() => {
    if (!tutorId) {
      throw new Error("Faça login para desselecionar um pet.");
    }

    const anterior = lerEstadoPet(tutorId);

    gravarPetAtivo(tutorId, null);

    setEstado({
      pets: anterior.pets,
      petAtivoId: null,
    });
  }, [tutorId]);

  const atualizarPet = useCallback(
    (petId, alteracoes) => {
      if (!tutorId) {
        throw new Error("Faça login para editar um pet.");
      }

      const anterior = lerEstadoPet(tutorId);

      const original = anterior.pets.find(
        (pet) => String(pet.id) === String(petId),
      );

      if (!original) {
        throw new Error("Pet não encontrado.");
      }

      const atualizado = {
        ...original,
        ...alteracoes,
        id: original.id,
      };

      const lista = anterior.pets.map((pet) =>
        String(pet.id) === String(petId) ? atualizado : pet,
      );

      gravarPets(tutorId, lista);

      setEstado({
        pets: lista,
        petAtivoId: anterior.petAtivoId,
      });

      return atualizado;
    },
    [tutorId],
  );

  const excluirPet = useCallback(
    (petId) => {
      if (!tutorId) {
        throw new Error("Faça login para excluir um pet.");
      }

      const anterior = lerEstadoPet(tutorId);

      const existe = anterior.pets.some(
        (pet) => String(pet.id) === String(petId),
      );

      if (!existe) {
        throw new Error("Pet não encontrado.");
      }

      const lista = anterior.pets.filter(
        (pet) => String(pet.id) !== String(petId),
      );

      const eraAtivo = anterior.petAtivoId === String(petId);

      gravarPets(tutorId, lista);

      if (eraAtivo) {
        gravarPetAtivo(tutorId, null);
      }

      setEstado({
        pets: lista,
        petAtivoId: eraAtivo ? null : anterior.petAtivoId,
      });
    },
    [tutorId],
  );

  const petAtivo =
    estado.pets.find((pet) => String(pet.id) === estado.petAtivoId) || null;

  const valor = useMemo(
    () => ({
      pets: estado.pets,
      petAtivo,
      adicionarPet,
      selecionarPet,
      desselecionarPet,
      atualizarPet,
      excluirPet,
    }),
    [
      estado.pets,
      petAtivo,
      adicionarPet,
      selecionarPet,
      desselecionarPet,
      atualizarPet,
      excluirPet,
    ],
  );

  return (
    <PetAtivoContext.Provider value={valor}>
      {children}
    </PetAtivoContext.Provider>
  );
}

export function PetAtivoProvider({ children }) {
  const { user } = useAuth();

  const tutorId =
    user?.id != null
      ? String(user.id)
      : user?.email
        ? String(user.email)
        : null;

  return (
    <SessaoPetAtivo key={tutorId ?? "sem-tutor"} tutorId={tutorId}>
      {children}
    </SessaoPetAtivo>
  );
}
