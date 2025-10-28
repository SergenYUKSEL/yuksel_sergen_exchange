import express from 'express';
import { calculateChange, initializeRegister } from '../services/cashRegister.js';

const router = express.Router();

// In-memory register state (in production, use database)
let registerState = {
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

/**
 * POST /api/calculate-change
 * Calculate change for a transaction
 */
router.post('/calculate-change', (req, res) => {
  try {
    const { amountDue, totalGiven, strategy, preferredDenominations } = req.body;
    
    // Validate input
    if (!amountDue || !totalGiven) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (amountDue <= 0) {
      return res.status(400).json({ error: 'Amount due must be positive' });
    }
    
    // Calculate change
    const result = calculateChange(
      amountDue,
      totalGiven,
      registerState,
      strategy || 'maxLarge',
      preferredDenominations || []
    );
    
    // Update register state
    registerState = result.updatedRegister;
    
    res.json({
      success: true,
      change: result.change,
      changeAmount: result.changeAmount,
      updatedRegister: result.updatedRegister
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * GET /api/register-state
 * Get current register state
 */
router.get('/register-state', (req, res) => {
  res.json({
    success: true,
    register: registerState
  });
});

/**
 * POST /api/reset-register
 * Reset register to initial state
 */
router.post('/reset-register', (req, res) => {
  const { initialState } = req.body;
  
  if (initialState) {
    registerState = initialState;
  } else {
    registerState = {
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
  }
  
  res.json({
    success: true,
    register: registerState
  });
});

export default router;
