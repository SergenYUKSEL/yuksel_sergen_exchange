import {
  calculateChange,
  calculateTotal,
  calculateChangeMaxLarge,
  calculateChangeMaxSmall,
  calculateChangePreferred,
  updateRegister,
  initializeRegister,
  validateRegister
} from '../../src/services/cashRegister.js';

describe('Cash Register - Unit Tests', () => {
  
  describe('calculateTotal', () => {
    test('should calculate total from denominations', () => {
      const denominations = {
        '200': 1,
        '50': 1,
        '20': 1,
        '5': 1,
        '2': 1
      };
      expect(calculateTotal(denominations)).toBe(277);
    });
    
    test('should handle empty denominations', () => {
      expect(calculateTotal({})).toBe(0);
    });
    
    test('should handle decimal denominations', () => {
      const denominations = {
        '0.5': 2,
        '0.2': 3,
        '0.1': 1
      };
      expect(calculateTotal(denominations)).toBeCloseTo(1.7, 2);
    });
  });
  
  describe('calculateChangeMaxLarge', () => {
    const registerState = {
      '0.05': 20,
      '0.1': 30,
      '0.2': 20,
      '0.5': 15,
      '1': 25,
      '2': 10,
      '5': 8,
      '10': 5,
      '20': 4,
      '50': 2,
      '100': 3,
      '200': 3,
      '500': 0
    };
    
    test('should calculate change using largest denominations', () => {
      const change = calculateChangeMaxLarge(77, registerState);
      expect(change).toEqual({
        '50': 1,
        '20': 1,
        '5': 1,
        '2': 1
      });
    });
    
    test('should return null if exact change impossible', () => {
      const limitedRegister = {
        '100': 1,
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
      };
      const change = calculateChangeMaxLarge(77, limitedRegister);
      expect(change).toBeNull();
    });
    
    test('should handle decimal amounts', () => {
      const change = calculateChangeMaxLarge(1.35, registerState);
      expect(change).toBeTruthy();
      expect(calculateTotal(change)).toBeCloseTo(1.35, 2);
    });
  });

  describe('calculateChangeMaxSmall', () => {
    const registerState = {
      '0.05': 20,
      '0.1': 30,
      '0.2': 20,
      '0.5': 15,
      '1': 25,
      '2': 10,
      '5': 8,
      '10': 5,
      '20': 4,
      '50': 2,
      '100': 3,
      '200': 3,
      '500': 0
    };
    
    test('should calculate change using smallest denominations', () => {
      const change = calculateChangeMaxSmall(1.5, registerState);
      expect(change).toBeTruthy();
      expect(calculateTotal(change)).toBeCloseTo(1.5, 2);
      // Should prefer smaller denominations
      expect(change['0.05'] || 0).toBeGreaterThan(0);
    });
  });
  
  describe('calculateChangePreferred', () => {
    const registerState = {
      '0.05': 20,
      '0.1': 30,
      '0.2': 20,
      '0.5': 15,
      '1': 25,
      '2': 10,
      '5': 8,
      '10': 5,
      '20': 4,
      '50': 2,
      '100': 3,
      '200': 3,
      '500': 0
    };
    
    test('should prioritize preferred denominations', () => {
      const change = calculateChangePreferred(30, registerState, [10, 5]);
      expect(change).toBeTruthy();
      expect(change['10'] || 0).toBeGreaterThan(0);
    });
    
    test('should fallback to other denominations if needed', () => {
      const change = calculateChangePreferred(77, registerState, [100]);
      expect(change).toBeTruthy();
      expect(calculateTotal(change)).toBe(77);
    });
  });
  
  describe('updateRegister', () => {
    test('should add given and remove change', () => {
      const initial = {
        '50': 2,
        '20': 4,
        '10': 5
      };
      const given = { '200': 1 };
      const change = { '50': 1, '20': 1, '10': 1 };
      
      const updated = updateRegister(initial, given, change);
      
      expect(updated['200']).toBe(1);
      expect(updated['50']).toBe(1);
      expect(updated['20']).toBe(3);
      expect(updated['10']).toBe(4);
    });
  });
  
  describe('initializeRegister', () => {
    test('should create register with all denominations at 0', () => {
      const register = initializeRegister();
      expect(register['500']).toBe(0);
      expect(register['0.05']).toBe(0);
      expect(Object.keys(register).length).toBe(13);
    });
  });
  
  describe('validateRegister', () => {
    test('should validate correct register', () => {
      const register = {
        '500': 0,
        '200': 3,
        '100': 5,
        '50': 2,
        '20': 4,
        '10': 5,
        '5': 8,
        '2': 10,
        '1': 25,
        '0.5': 15,
        '0.2': 20,
        '0.1': 30,
        '0.05': 20
      };
      expect(validateRegister(register)).toBe(true);
    });
    
    test('should reject register with negative values', () => {
      const register = {
        '50': -1,
        '20': 4
      };
      expect(validateRegister(register)).toBe(false);
    });
    
    test('should reject register with invalid denominations', () => {
      const register = {
        '75': 1,
        '20': 4
      };
      expect(validateRegister(register)).toBe(false);
    });
  });
  
  describe('calculateChange - Integration', () => {
    const registerState = {
      '0.05': 20,
      '0.1': 30,
      '0.2': 20,
      '0.5': 15,
      '1': 25,
      '2': 10,
      '5': 8,
      '10': 5,
      '20': 4,
      '50': 2,
      '100': 3,
      '200': 3,
      '500': 0
    };
    
    test('should calculate change for exact payment', () => {
      const result = calculateChange(123, { '100': 1, '20': 1, '2': 1, '1': 1 }, registerState);
      expect(result.changeAmount).toBe(0);
      expect(result.change).toEqual({});
    });
    
    test('should calculate change for overpayment', () => {
      const result = calculateChange(123, { '200': 1 }, registerState);
      expect(result.changeAmount).toBe(77);
      expect(calculateTotal(result.change)).toBe(77);
    });
    
    test('should throw error for insufficient payment', () => {
      expect(() => {
        calculateChange(123, { '100': 1 }, registerState);
      }).toThrow('Insufficient payment');
    });
    
    test('should throw error when exact change impossible', () => {
      const emptyRegister = initializeRegister();
      expect(() => {
        calculateChange(123, { '200': 1 }, emptyRegister);
      }).toThrow('Unable to provide exact change');
    });
  });
});
