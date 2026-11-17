const request = require('supertest');
const app = require('../src/app');
const errorMiddleware = require('../src/middlewares/errorMiddleware');

describe('Infraestrutura da API e Middlewares - Pares & Patinhas', () => {
  it('Deve retornar status 200 na rota /api/health', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      message: 'API Pares & Patinhas funcionando!',
    });
  });

  it('Deve retornar 404 para uma rota inexistente (notFoundMiddleware)', async () => {
    const res = await request(app).get('/rota-que-nao-existe-123');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: 'Não encontramos o recurso solicitado.',
    });
  });

  describe('Testes Unitários do errorMiddleware', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('Deve retornar status 500 e mensagem padrão quando o erro não tem statusCode válido', () => {
      const erro = new Error('Falha inesperada no banco');
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      errorMiddleware(erro, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Não foi possível concluir sua solicitação.',
      });
    });

    it('Deve retornar o statusCode e a mensagem customizada quando informados (400-599)', () => {
      const erro = { statusCode: 400, message: 'Dados inválidos enviados.' };
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      errorMiddleware(erro, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Dados inválidos enviados.',
      });
    });

    it('Deve usar a mensagem padrão se o erro tiver statusCode válido mas vier sem message', () => {
      const erro = { statusCode: 422 };
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      errorMiddleware(erro, req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Não foi possível concluir sua solicitação.',
      });
    });
  });
});