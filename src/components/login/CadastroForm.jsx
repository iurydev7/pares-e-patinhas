import { useState } from "react";
import FormField from "./FormField";
import VerificarEmailForm from "./VerificarEmailForm";
import { REGRAS_SENHA, senhaForte } from "../../utils/senha";

function CadastroForm({ onCadastrar, onVerificar, onReenviar, onSucesso }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  // Preenchido depois que a conta é criada: troca o formulário pela etapa do código.
  const [emailAVerificar, setEmailAVerificar] = useState("");

  async function enviarFormulario(evento) {
    evento.preventDefault();
    setErro("");

    if (!nome.trim() || !email.trim() || !senha || !confirmar) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setErro("Digite um e-mail válido.");
      return;
    }
    if (!senhaForte(senha)) {
      setErro("A senha ainda não atende a todos os requisitos abaixo do campo.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setEnviando(true);
    try {
      const criou = await onCadastrar(nome, email, senha);
      if (criou) {
        // Conta criada: falta confirmar o código enviado por e-mail.
        setEmailAVerificar(email.trim().toLowerCase());
      } else {
        setErro("Este e-mail já está cadastrado.");
      }
    } catch (falha) {
      setErro(
        falha?.response?.data?.message ||
          "Não foi possível criar a conta agora. Tente novamente em instantes.",
      );
    } finally {
      setEnviando(false);
    }
  }

  if (emailAVerificar) {
    return (
      <VerificarEmailForm
        email={emailAVerificar}
        onVerificar={onVerificar}
        onReenviar={onReenviar}
        onSucesso={onSucesso}
        onVoltar={() => setEmailAVerificar("")}
      />
    );
  }

  return (
    <form className="login-form" onSubmit={enviarFormulario} noValidate>
      <h2 className="login-form__titulo">Crie sua conta</h2>
      <p className="login-form__subtitulo">Leva menos de um minuto.</p>

      <FormField
        id="cadastro-nome"
        label="Nome"
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        placeholder="Seu nome"
      />
      <FormField
        id="cadastro-email"
        label="E-mail"
        type="email"
        value={email}
        onChange={(evento) => setEmail(evento.target.value)}
        placeholder="voce@email.com"
      />
      <FormField
        id="cadastro-senha"
        label="Senha"
        type="password"
        value={senha}
        onChange={(evento) => setSenha(evento.target.value)}
        placeholder="Crie uma senha forte"
      />
      <ul className="senha-regras" aria-label="Requisitos da senha">
        {REGRAS_SENHA.map((regra) => {
          const ok = regra.teste(senha);
          return (
            <li
              key={regra.id}
              className={
                ok
                  ? "senha-regras__item senha-regras__item--ok"
                  : "senha-regras__item"
              }
            >
              <span aria-hidden="true">{ok ? "✓" : "○"}</span> {regra.rotulo}
              <span className="visually-hidden">
                {ok ? " (atendido)" : " (pendente)"}
              </span>
            </li>
          );
        })}
      </ul>
      <FormField
        id="cadastro-confirmar"
        label="Confirmar senha"
        type="password"
        value={confirmar}
        onChange={(evento) => setConfirmar(evento.target.value)}
        placeholder="Repita a senha"
      />

      {erro && (
        <p className="login-form__erro" role="alert">
          {erro}
        </p>
      )}

      <button className="login-form__botao" type="submit" disabled={enviando}>
        {enviando ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}

export default CadastroForm;
