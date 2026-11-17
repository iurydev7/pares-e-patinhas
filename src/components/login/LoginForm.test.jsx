
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "./LoginForm";

describe("Componente LoginForm", () => {
  it("deve exibir os campos de e-mail e senha", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Entrar" })
    ).toBeInTheDocument();
  });

  it("deve impedir o login quando os campos estão vazios", async () => {
    const onLogin = vi.fn();

    render(<LoginForm onLogin={onLogin} />);

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Preencha e-mail e senha.");

    expect(onLogin).not.toHaveBeenCalled();
  });

  it("deve chamar onLogin com e-mail e senha preenchidos", async () => {
    const onLogin = vi.fn().mockResolvedValue(false);

    render(<LoginForm onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "tutor@email.com" },
    });

    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "Senha@123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith(
        "tutor@email.com",
        "Senha@123"
      );
    });
  });

  it("deve exibir erro quando as credenciais são incorretas", async () => {
    const onLogin = vi.fn().mockResolvedValue(false);

    render(<LoginForm onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "tutor@email.com" },
    });

    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "senhaerrada" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("E-mail ou senha incorretos.");
  });

  it("deve chamar onSucesso quando o login é realizado", async () => {
    const onLogin = vi.fn().mockResolvedValue(true);
    const onSucesso = vi.fn();

    render(
      <LoginForm
        onLogin={onLogin}
        onSucesso={onSucesso}
      />
    );

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "tutor@email.com" },
    });

    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "Senha@123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(onSucesso).toHaveBeenCalledTimes(1);
    });
  });
});
