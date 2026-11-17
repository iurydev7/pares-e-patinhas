
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Componente Footer", () => {
  it("deve renderizar o rodapé na tela", () => {
    render(<Footer />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("deve exibir o nome Pares & Patinhas", () => {
    render(<Footer />);

    expect(
      screen.getByText(/2026 Pares & Patinhas/)
    ).toBeInTheDocument();
  });

  it("deve exibir os direitos reservados", () => {
    render(<Footer />);

    expect(
      screen.getByText(/Todos os direitos reservados/)
    ).toBeInTheDocument();
  });
});
