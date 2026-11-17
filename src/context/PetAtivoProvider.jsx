import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "./useAuth";
import { PetAtivoContext } from "./PetAtivoContext";
import api from "../services/api";

import {
  chavePets,
  chavePetAtivo,
  gravarPetAtivo,
  gravarPets,
  lerEstadoPet,
} from "../services/petStorage";

function mapearAnimal(animal, petLocal) {
  const sexo = animal.sexo?.toLowerCase() || "";
  const fotosDoBanco = Array.isArray(animal.fotos) ? animal.fotos : [];
  const fotosLocais = Array.isArray(petLocal?.fotos) ? petLocal.fotos : [];
  const fotos = fotosDoBanco.length > 0 ? fotosDoBanco : fotosLocais;
  const foto = animal.foto || fotos[0] || petLocal?.foto || "";

  return {
    ...petLocal,
    id: animal.id,
    nome: animal.nome,
    especie: animal.especie,
    sexo,
    genero: sexo,
    raca: animal.raca || "",
    idade: animal.idadeAnos,
    idadeAnos: animal.idadeAnos,
    idadeMeses: animal.idadeMeses,
    porte: animal.porte,
    descricao: animal.descricao || "",
    cidade: animal.cidade || "",
    estado: animal.estado || "",
    vacinas: petLocal?.vacinas || "",
    foto,
    fotos,
  };
}

function salvarCachePets(tutorId, pets, petAtivoId, setAviso) {
  try {
    gravarPets(tutorId, pets);
    gravarPetAtivo(tutorId, petAtivoId);
    setAviso("");
  } catch (error) {
    setAviso(
      `Os pets estão disponíveis nesta sessão, mas não foi possível atualizar o armazenamento local: ${error.message}`,
    );
  }
}

function SessaoPetAtivo({ children, tutorId }) {
  const [estado, setEstado] = useState(() => lerEstadoPet(tutorId));
  const [carregandoPets, setCarregandoPets] = useState(Boolean(tutorId));
  const [erroCarregamentoPets, setErroCarregamentoPets] = useState("");
  const [avisoCachePets, setAvisoCachePets] = useState("");

  useEffect(() => {
    if (!tutorId) {
      return;
    }

    let ativo = true;

    async function carregarPets() {
      setCarregandoPets(true);
      setErroCarregamentoPets("");
      setAvisoCachePets("");

      try {
        const resposta = await api.get("/animals/mine");
        const animais = resposta.data?.animais;

        if (!Array.isArray(animais)) {
          throw new Error("A resposta da lista de pets é inválida.");
        }

        const estadoAnterior = lerEstadoPet(tutorId);
        const petsLocais = new Map(
          estadoAnterior.pets.map((pet) => [String(pet.id), pet]),
        );
        const pets = animais.map((animal) =>
          mapearAnimal(animal, petsLocais.get(String(animal.id))),
        );
        const petAtivoId = pets.some(
          (pet) => String(pet.id) === estadoAnterior.petAtivoId,
        )
          ? estadoAnterior.petAtivoId
          : null;

        if (!ativo) return;

        setEstado({ pets, petAtivoId });
        salvarCachePets(
          tutorId,
          pets,
          petAtivoId,
          setAvisoCachePets,
        );
      } catch (error) {
        if (ativo) {
          setErroCarregamentoPets(
            error.response?.data?.mensagem ||
              error.response?.data?.message ||
              error.message ||
              "Não foi possível carregar os pets da sua conta.",
          );
        }
      } finally {
        if (ativo) {
          setCarregandoPets(false);
        }
      }
    }

    carregarPets();

    return () => {
      ativo = false;
    };
  }, [tutorId]);

  useEffect(() => {
    if (!tutorId) return;

    function sincronizar(evento) {
      if (
        evento.key === null ||
        evento.key === chavePets(tutorId) ||
        evento.key === chavePetAtivo(tutorId)
      ) {
        setEstado(lerEstadoPet(tutorId));
      }
    }

    window.addEventListener("storage", sincronizar);

    return () => {
      window.removeEventListener("storage", sincronizar);
    };
  }, [tutorId]);

  const adicionarPet = useCallback(
    (dados) => {
      if (!tutorId) {
        throw new Error("Faça login para cadastrar um pet.");
      }

      const anterior = estado;

      const novoPet = {
        ...dados,
        id: crypto.randomUUID(),
      };

      const lista = [...anterior.pets, novoPet];

      setEstado({
        pets: lista,
        petAtivoId: anterior.petAtivoId,
      });
      salvarCachePets(
        tutorId,
        lista,
        anterior.petAtivoId,
        setAvisoCachePets,
      );

      return novoPet;
    },
    [tutorId, estado],
  );

  const selecionarPet = useCallback(
    (petId) => {
      if (!tutorId) {
        throw new Error("Faça login para selecionar um pet.");
      }

      const anterior = estado;

      const escolhido = anterior.pets.find(
        (pet) => String(pet.id) === String(petId),
      );

      if (!escolhido) {
        throw new Error("Pet não encontrado.");
      }

      setEstado({
        pets: anterior.pets,
        petAtivoId: String(escolhido.id),
      });
      salvarCachePets(
        tutorId,
        anterior.pets,
        String(escolhido.id),
        setAvisoCachePets,
      );
    },
    [tutorId, estado],
  );

  const desselecionarPet = useCallback(() => {
    if (!tutorId) {
      throw new Error("Faça login para desselecionar um pet.");
    }

    const anterior = estado;

    setEstado({
      pets: anterior.pets,
      petAtivoId: null,
    });
    salvarCachePets(tutorId, anterior.pets, null, setAvisoCachePets);
  }, [tutorId, estado]);

  const atualizarPet = useCallback(
    (petId, alteracoes) => {
      if (!tutorId) {
        throw new Error("Faça login para editar um pet.");
      }

      const anterior = estado;

      const original = anterior.pets.find(
        (pet) => String(pet.id) === String(petId),
      );

      if (!original) {
        throw new Error("Pet não encontrado.");
      }

      const atualizado = {
        ...original,
        ...alteracoes,
        id: alteracoes.id ?? original.id,
      };

      const lista = anterior.pets.map((pet) =>
        String(pet.id) === String(petId) ? atualizado : pet,
      );

      const petAtivoId =
        anterior.petAtivoId === String(petId)
          ? String(atualizado.id)
          : anterior.petAtivoId;

      setEstado({
        pets: lista,
        petAtivoId,
      });
      salvarCachePets(tutorId, lista, petAtivoId, setAvisoCachePets);

      return atualizado;
    },
    [tutorId, estado],
  );

  const excluirPet = useCallback(
    async (petId) => {
      if (!tutorId) {
        throw new Error("Faça login para excluir um pet.");
      }

      const anterior = estado;

      const existe = anterior.pets.find(
        (pet) => String(pet.id) === String(petId),
      );

      if (!existe) {
        throw new Error("Pet não encontrado.");
      }

      const idBanco = Number(petId);
      if (Number.isSafeInteger(idBanco) && idBanco > 0) {
        await api.delete(`/animals/${idBanco}`);
      }

      const lista = anterior.pets.filter(
        (pet) => String(pet.id) !== String(petId),
      );

      const eraAtivo = anterior.petAtivoId === String(petId);

      if (eraAtivo) {
        setEstado({
          pets: lista,
          petAtivoId: null,
        });
      } else {
        setEstado({
          pets: lista,
          petAtivoId: anterior.petAtivoId,
        });
      }

      salvarCachePets(
        tutorId,
        lista,
        eraAtivo ? null : anterior.petAtivoId,
        setAvisoCachePets,
      );
    },
    [tutorId, estado],
  );

  const petAtivo =
    estado.pets.find((pet) => String(pet.id) === estado.petAtivoId) || null;

  const valor = useMemo(
    () => ({
      pets: estado.pets,
      petAtivo,
      carregandoPets,
      erroCarregamentoPets,
      avisoCachePets,
      adicionarPet,
      selecionarPet,
      desselecionarPet,
      atualizarPet,
      excluirPet,
    }),
    [
      estado.pets,
      petAtivo,
      carregandoPets,
      erroCarregamentoPets,
      avisoCachePets,
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
