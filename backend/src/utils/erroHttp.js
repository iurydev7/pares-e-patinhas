function erroHttp( messagem, statusCode ) {
    const erro = new Error(messagem);
    erro.statusCode = statusCode;
    return erro;
}

module.exports= erroHttp;