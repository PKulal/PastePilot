const request = require('supertest');
const { app } = require('../server');

describe('API Endpoints', () => {
  let server;
  beforeAll((done) => {
    server = app.listen(5001, () => {
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should return 200 on /api/health', async () => {
    const res = await request(server).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(server).get('/api/unknown');
    expect(res.statusCode).toEqual(404);
  });
});
