describe('Pares & Patinhas - Teste E2E Inicial', () => {
  it('Deve carregar a aplicação com sucesso', () => {
    cy.visit('http://localhost:5173') 
    cy.get('body').should('be.visible')
  })
})