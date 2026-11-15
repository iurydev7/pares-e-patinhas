import { useContext } from "react";
import { PetAtivoContext } from "./PetAtivoContext";

export function usePetAtivo() {
  const contexto = useContext(PetAtivoContext);
  if (!contexto) {
    throw new Error("usePetAtivo precisa estar dentro de PetAtivoProvider.");
  }
  return contexto;
}
