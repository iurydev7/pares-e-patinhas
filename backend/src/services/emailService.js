const { VALIDADE_MINUTOS } = require('../utils/codigoVerificacao')

const NOME_REMETENTE = 'Pares & Patinhas'

const enderecoRemetente = () => process.env.MAIL_FROM || process.env.MAIL_USER

/**
 * MAIL_DRIVER:
 *  - smtp       → SMTP do Gmail/Workspace com Senha de App (Nodemailer)
 *  - gmail_api  → API do Gmail por HTTPS (funciona onde as portas SMTP são bloqueadas, ex.: Render Free)
 *  - console    → só imprime no terminal (padrão em desenvolvimento)
 */
function driverAtual() {
  if (process.env.MAIL_DRIVER) return process.env.MAIL_DRIVER
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'MAIL_DRIVER não definido: configure o envio de e-mail em produção.'
    )
  }
  return 'console'
}

async function enviarPorSmtp({ para, assunto, texto, html }) {
  const nodemailer = require('nodemailer')
  const dns = require('dns').promises

  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const porta = Number(process.env.SMTP_PORT || 465)

  const { address } = await dns.lookup(host, { family: 4 })

  const transporte = nodemailer.createTransport({
    host: address,
    port: porta,
    secure: porta === 465,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_APP_PASSWORD },
    // Como conectamos pelo IP, informamos o nome para a validação do certificado.
    tls: { servername: host },
    connectionTimeout: 10000
  })
  await transporte.sendMail({
    from: { name: NOME_REMETENTE, address: enderecoRemetente() },
    to: para,
    subject: assunto,
    text: texto,
    html
  })
}

const b64 = valor => Buffer.from(valor, 'utf8').toString('base64')

function montarMime({ para, assunto, html }) {
  return [
    `From: ${NOME_REMETENTE} <${enderecoRemetente()}>`,
    `To: ${para}`,
    `Subject: =?UTF-8?B?${b64(assunto)}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(html).replace(/(.{76})/g, '$1\r\n')
  ].join('\r\n')
}

async function enviarPorGmailApi(mensagem) {
  const renovacao = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  })
  if (!renovacao.ok)
    throw new Error(
      `Gmail API: falha ao renovar o token de acesso (HTTP ${renovacao.status}).`
    )
  const { access_token: accessToken } = await renovacao.json()

  const envio = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: Buffer.from(montarMime(mensagem), 'utf8').toString('base64url')
      })
    }
  )
  if (!envio.ok)
    throw new Error(
      `Gmail API: falha ao enviar o e-mail (HTTP ${envio.status}).`
    )
}

async function enviarEmail(mensagem) {
  const driver = driverAtual()
  if (driver === 'smtp') return enviarPorSmtp(mensagem)
  if (driver === 'gmail_api') return enviarPorGmailApi(mensagem)
  if (driver === 'console')
    return void console.log(
      `[e-mail → ${mensagem.para}] ${mensagem.assunto}\n${mensagem.texto}`
    )
  throw new Error(`MAIL_DRIVER desconhecido: ${driver}`)
}

const escaparHtml = texto =>
  String(texto).replace(
    /[&<>"']/g,
    c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]
  )

async function enviarCodigoVerificacao({ para, nome, codigo }) {
  const assunto = `${codigo} é o seu código do Pares & Patinhas`
  const texto = [
    `Olá, ${nome}!`,
    '',
    `Seu código de verificação é: ${codigo}`,
    `Ele vale por ${VALIDADE_MINUTOS} minutos.`,
    '',
    'Se você não criou uma conta no Pares & Patinhas, ignore este e-mail.'
  ].join('\n')
  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#3b2a4a">
  <h2 style="margin:0 0 12px">Confirme seu e-mail 🐾</h2>
  <p>Olá, ${escaparHtml(nome)}! Use o código abaixo para concluir seu cadastro no Pares &amp; Patinhas:</p>
  <p style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;background:#f4eefb;border-radius:12px;padding:16px;margin:20px 0">${codigo}</p>
  <p>O código vale por <strong>${VALIDADE_MINUTOS} minutos</strong>.</p>
  <p style="font-size:12px;color:#8d8397">Se você não criou uma conta no Pares &amp; Patinhas, ignore este e-mail.</p>
</div>`.trim()

  await enviarEmail({ para, assunto, texto, html })
}

module.exports = { enviarEmail, enviarCodigoVerificacao }
