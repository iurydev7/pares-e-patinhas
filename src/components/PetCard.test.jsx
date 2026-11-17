
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PetCard from "./PetCard";

const petTeste = {
  id: 1,
  nome: "Rex",
  imagem: "/imagens/rex.jpg",
  idade: 3,
  cidade: "Fortaleza",
  estado: "CE",
  especie: "Cachorro",
  sexo: "Macho",
  raca: "Labrador",
};

function renderPetCard(props = {}) {
  return render(
    <MemoryRouter>
      <PetCard
        pet={petTeste}
        onCurtir={vi.fn()}
        onPassar={vi.fn()}
        {...props}
      />
    </MemoryRouter>
  );
}

describe("Componente PetCard", () => {
  it("deve exibir o nome do animal", () => {
    renderPetCard();

    expect(screen.getByText("Rex")).toBeInTheDocument();
  });

  it("deve exibir a idade do animal", () => {
    renderPetCard();

    expect(screen.getByText("3 anos")).toBeInTheDocument();
  });

  it("deve exibir cidade e estado", () => {
    renderPetCard();

    expect(screen.getByText("Fortaleza, CE")).toBeInTheDocument();
  });

  it("deve exibir a imagem com o nome do animal", () => {
    renderPetCard();

    expect(screen.getByRole("img", { name: "Rex" }))
      .toHaveAttribute("src", "/imagens/rex.jpg");
  });

  it("deve chamar a função ao clicar em Dar patinha", () => {
    const onCurtir = vi.fn();

    renderPetCard({ onCurtir });

    fireEvent.click(
      screen.getByRole("button", { name: /Dar patinha/i })
    );

    expect(onCurtir).toHaveBeenCalledTimes(1);
  });

  it("deve chamar a função ao clicar em Passar", () => {
    const onPassar = vi.fn();

    renderPetCard({ onPassar });

    fireEvent.click(
      screen.getByRole("button", { name: /Passar/i })
    );

    expect(onPassar).toHaveBeenCalledTimes(1);
  });
});
