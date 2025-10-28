import request from 'supertest';
import app, { server } from '../../src/app.js';

describe('Cash Register - E2E Tests', () => {
  
  afterAll((done) => {
    server.close(done);
  });
  
  describe('Complete transaction workflow', () => {
    test('should complete full transaction from start to finish', async () => {
      // Step 1: Reset register to known state
      const resetRes = await request(app)
        .post('/api/reset-register')
        .send({});
      
      expect(resetRes.status).toBe(200);
      const initialRegister = resetRes.body.register;
      
      // Step 2: Get initial register state
      const stateRes1 = await request(app)
        .get('/api/register-state');
      
      expect(stateRes1.status).toBe(200);
      expect(stateRes1.body.register).toEqual(initialRegister);
      
      // Step 3: Customer owes 123 TL and gives 200 TL
      const transactionRes = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 123,
          totalGiven: { '200': 1 },
          strategy: 'maxLarge'
        });
      
      expect(transactionRes.status).toBe(200);
      expect(transactionRes.body.success).toBe(true);
      expect(transactionRes.body.changeAmount).toBe(77);
      
      // Verify change is correct
      const change = transactionRes.body.change;
      let totalChange = 0;
      for (const [denom, count] of Object.entries(change)) {
        totalChange += parseFloat(denom) * count;
      }
      expect(totalChange).toBe(77);
      
      // Step 4: Verify register was updated correctly
      const stateRes2 = await request(app)
        .get('/api/register-state');
      
      const updatedRegister = stateRes2.body.register;
      
      // Register should have gained the 200 TL note
      expect(updatedRegister['200']).toBe(initialRegister['200'] + 1);
      
      // Register should have lost the change denominations
      for (const [denom, count] of Object.entries(change)) {
        expect(updatedRegister[denom]).toBe(initialRegister[denom] - count);
      }
    });
    
    test('should handle scenario where exact change is not possible', async () => {
      // Reset with limited denominations
      await request(app)
        .post('/api/reset-register')
        .send({
          initialState: {
            '100': 5,
            '50': 0,
            '20': 0,
            '10': 0,
            '5': 0,
            '2': 0,
            '1': 0,
            '0.5': 0,
            '0.2': 0,
            '0.1': 0,
            '0.05': 0
          }
        });
      
      // Try to get 77 TL change (impossible with only 100 TL notes)
      const response = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 123,
          totalGiven: { '200': 1 }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Unable to provide exact change');
    });
  });
  
  describe('Real-world scenarios', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/reset-register')
        .send({});
    });
    
    test('Scenario 1: Small purchase with large bill', async () => {
      const response = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 5.50,
          totalGiven: { '20': 1 }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.changeAmount).toBeCloseTo(14.5, 2);
    });
    
    test('Scenario 2: Exact payment', async () => {
      const response = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 25,
          totalGiven: { '20': 1, '5': 1 }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.changeAmount).toBe(0);
      expect(Object.keys(response.body.change).length).toBe(0);
    });
    
    test('Scenario 3: Multiple denominations given', async () => {
      const response = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 47.35,
          totalGiven: {
            '20': 2,
            '5': 1,
            '2': 1,
            '0.5': 1
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.changeAmount).toBeCloseTo(0.15, 2);
    });
    
    test('Scenario 4: Preferred denominations strategy', async () => {
      const response = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 60,
          totalGiven: { '100': 1 },
          strategy: 'preferred',
          preferredDenominations: [20, 10, 5]
        });
      
      expect(response.status).toBe(200);
      expect(response.body.changeAmount).toBe(40);
      
      // Should prefer 20s, 10s, and 5s
      const change = response.body.change;
      const usedDenoms = Object.keys(change).map(d => parseFloat(d));
      const preferredUsed = usedDenoms.filter(d => [20, 10, 5].includes(d));
      expect(preferredUsed.length).toBeGreaterThan(0);
    });
    
    test('Scenario 5: Sequential transactions depleting register', async () => {
      // Transaction 1: Use up some 50s
      await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 50,
          totalGiven: { '100': 1 }
        });
      
      // Transaction 2: Use up more large denominations
      await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 30,
          totalGiven: { '100': 1 }
        });
      
      // Check register state
      const stateRes = await request(app)
        .get('/api/register-state');
      
      expect(stateRes.body.register['100']).toBeGreaterThan(3); // Gained 2
      expect(stateRes.body.register['50']).toBeLessThan(2); // Lost some
    });
  });
  
  describe('Edge cases', () => {
    test('should handle very small amounts', async () => {
      await request(app)
        .post('/api/reset-register')
        .send({});
      
      const response = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 0.05,
          totalGiven: { '0.1': 1 }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.changeAmount).toBeCloseTo(0.05, 2);
    });
    
    test('should handle large amounts', async () => {
      await request(app)
        .post('/api/reset-register')
        .send({});
      
      const response = await request(app)
        .post('/api/calculate-change')
        .send({
          amountDue: 1000,
          totalGiven: { '500': 2, '100': 1 }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.changeAmount).toBe(100);
    });
  });
});
