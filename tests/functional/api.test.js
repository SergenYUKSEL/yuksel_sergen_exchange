import request from 'supertest';
import app from '../../src/app.js';

describe('Cash Register API - Functional Tests', () => {
  
  beforeEach(async () => {
    // Reset register before each test
    await request(app)
      .post('/api/reset-register')
      .send({});
  });
  
  describe('POST /api/calculate-change', () => {
    test('should calculate change successfully', async () => {
      const response = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 123,
          totalGiven: { '200': 1 },
          strategy: 'maxLarge'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.changeAmount).toBe(77);
      expect(response.body.change).toBeDefined();
    });
    
    test('should return error for insufficient payment', async () => {
      const response = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 123,
          totalGiven: { '100': 1 }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Insufficient payment');
    });
    
    test('should return error for missing fields', async () => {
      const response = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 123
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
    
    test('should return error for invalid amount', async () => {
      const response = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: -10,
          totalGiven: { '100': 1 }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('must be positive');
    });
    
    test('should handle maxSmall strategy', async () => {
      const response = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 10,
          totalGiven: { '20': 1 },
          strategy: 'maxSmall'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.changeAmount).toBe(10);
    });
    
    test('should handle preferred strategy', async () => {
      const response = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 50,
          totalGiven: { '100': 1 },
          strategy: 'preferred',
          preferredDenominations: [20, 10]
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.changeAmount).toBe(50);
    });
  });
  
  describe('GET /api/register-state', () => {
    test('should return current register state', async () => {
      const response = await request(app)
        .get('/api/register-state');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.register).toBeDefined();
      expect(response.body.register['0.05']).toBeDefined();
    });
  });
  
  describe('POST /api/reset-register', () => {
    test('should reset register to default state', async () => {
      // First, make a transaction
      await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 50,
          totalGiven: { '100': 1 }
        });
      
      // Reset
      const response = await request(app)
        .post('/api/reset-register')
        .send({});
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.register).toBeDefined();
    });
    
    test('should reset register with custom state', async () => {
      const customState = {
        '100': 10,
        '50': 20,
        '20': 30
      };
      
      const response = await request(app)
        .post('/api/reset-register')
        .send({ initialState: customState });
      
      expect(response.status).toBe(200);
      expect(response.body.register['100']).toBe(10);
      expect(response.body.register['50']).toBe(20);
    });
  });
  
  describe('Integration - Multiple transactions', () => {
    test('should handle multiple consecutive transactions', async () => {
      // Transaction 1
      const res1 = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 30,
          totalGiven: { '50': 1 }
        });
      expect(res1.body.success).toBe(true);
      
      // Transaction 2
      const res2 = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 15,
          totalGiven: { '20': 1 }
        });
      expect(res2.body.success).toBe(true);
      
      // Check register state
      const stateRes = await request(app)
        .get('/api/register-state');
      expect(stateRes.body.register['50']).toBe(3); // Initial 2 + 1 from transaction
      expect(stateRes.body.register['20']).toBe(4); // Initial 4 + 1 - 1
    });
  });
});
