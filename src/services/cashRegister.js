/**
 * Cash Register Service
 * Handles change calculation and cash register management
 */

const DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05];

/**
 * Calculate change to return to customer
 * @param {number} amountDue - Amount owed by customer
 * @param {Object} totalGiven - Denominations given by customer
 * @param {Object} registerState - Current state of cash register
 * @param {string} strategy - Change strategy: 'maxLarge', 'maxSmall', 'preferred'
 * @param {Array} preferredDenominations - Preferred denominations for 'preferred' strategy
 * @returns {Object} - Change to return and updated register state
 */
export function calculateChange(amountDue, totalGiven, registerState, strategy = 'maxLarge', preferredDenominations = []) {
  // Calculate total given by customer
  const totalGivenAmount = calculateTotal(totalGiven);
  
  // Validate payment
  if (totalGivenAmount < amountDue) {
    throw new Error('Insufficient payment');
  }
  
  // Calculate change amount
  const changeAmount = Math.round((totalGivenAmount - amountDue) * 100) / 100;
  
  if (changeAmount === 0) {
    return {
      change: {},
      updatedRegister: updateRegister(registerState, totalGiven, {}),
      changeAmount: 0
    };
  }
  
  // Calculate change based on strategy
  let change;
  switch (strategy) {
    case 'maxSmall':
      change = calculateChangeMaxSmall(changeAmount, registerState);
      break;
    case 'preferred':
      change = calculateChangePreferred(changeAmount, registerState, preferredDenominations);
      break;
    case 'maxLarge':
    default:
      change = calculateChangeMaxLarge(changeAmount, registerState);
  }
  
  if (!change) {
    throw new Error('Unable to provide exact change');
  }
  
  // Update register: add given, remove change
  const updatedRegister = updateRegister(registerState, totalGiven, change);
  
  return {
    change,
    updatedRegister,
    changeAmount
  };
}

/**
 * Calculate total amount from denominations
 * @param {Object} denominations - Object with denomination values as keys
 * @returns {number} - Total amount
 */
export function calculateTotal(denominations) {
  return Object.entries(denominations).reduce((total, [denom, count]) => {
    return total + (parseFloat(denom) * count);
  }, 0);
}

/**
 * Calculate change using largest denominations first (greedy algorithm)
 * @param {number} amount - Amount to return
 * @param {Object} registerState - Current register state
 * @returns {Object|null} - Change denominations or null if impossible
 */
export function calculateChangeMaxLarge(amount, registerState) {
  const change = {};
  let remaining = Math.round(amount * 100) / 100;
  
  for (const denom of DENOMINATIONS) {
    const denomKey = denom.toString();
    const available = registerState[denomKey] || 0;
    
    if (available > 0 && remaining >= denom) {
      const needed = Math.floor(remaining / denom);
      const toUse = Math.min(needed, available);
      
      if (toUse > 0) {
        change[denomKey] = toUse;
        remaining = Math.round((remaining - (denom * toUse)) * 100) / 100;
      }
    }
  }
  
  return remaining === 0 ? change : null;
}

/**
 * Calculate change using smallest denominations first
 * @param {number} amount - Amount to return
 * @param {Object} registerState - Current register state
 * @returns {Object|null} - Change denominations or null if impossible
 */
export function calculateChangeMaxSmall(amount, registerState) {
  const change = {};
  let remaining = Math.round(amount * 100) / 100;
  const reversedDenoms = [...DENOMINATIONS].reverse();
  
  for (const denom of reversedDenoms) {
    const denomKey = denom.toString();
    const available = registerState[denomKey] || 0;
    
    if (available > 0 && remaining >= denom) {
      const needed = Math.floor(remaining / denom);
      const toUse = Math.min(needed, available);
      
      if (toUse > 0) {
        change[denomKey] = toUse;
        remaining = Math.round((remaining - (denom * toUse)) * 100) / 100;
      }
    }
  }
  
  return remaining === 0 ? change : null;
}

/**
 * Calculate change using preferred denominations
 * @param {number} amount - Amount to return
 * @param {Object} registerState - Current register state
 * @param {Array} preferred - Preferred denominations
 * @returns {Object|null} - Change denominations or null if impossible
 */
export function calculateChangePreferred(amount, registerState, preferred) {
  if (!preferred || preferred.length === 0) {
    return calculateChangeMaxLarge(amount, registerState);
  }
  
  const change = {};
  let remaining = Math.round(amount * 100) / 100;
  
  // Try preferred denominations first
  const sortedPreferred = [...preferred].sort((a, b) => b - a);
  
  for (const denom of sortedPreferred) {
    const denomKey = denom.toString();
    const available = registerState[denomKey] || 0;
    
    if (available > 0 && remaining >= denom) {
      const needed = Math.floor(remaining / denom);
      const toUse = Math.min(needed, available);
      
      if (toUse > 0) {
        change[denomKey] = toUse;
        remaining = Math.round((remaining - (denom * toUse)) * 100) / 100;
      }
    }
  }
  
  // If still remaining, use other denominations
  if (remaining > 0) {
    const otherDenoms = DENOMINATIONS.filter(d => !preferred.includes(d));
    for (const denom of otherDenoms) {
      const denomKey = denom.toString();
      const available = (registerState[denomKey] || 0) - (change[denomKey] || 0);
      
      if (available > 0 && remaining >= denom) {
        const needed = Math.floor(remaining / denom);
        const toUse = Math.min(needed, available);
        
        if (toUse > 0) {
          change[denomKey] = (change[denomKey] || 0) + toUse;
          remaining = Math.round((remaining - (denom * toUse)) * 100) / 100;
        }
      }
    }
  }
  
  return remaining === 0 ? change : null;
}

/**
 * Update register state after transaction
 * @param {Object} registerState - Current register state
 * @param {Object} given - Denominations given by customer
 * @param {Object} change - Change returned to customer
 * @returns {Object} - Updated register state
 */
export function updateRegister(registerState, given, change) {
  const updated = { ...registerState };
  
  // Add given denominations
  for (const [denom, count] of Object.entries(given)) {
    updated[denom] = (updated[denom] || 0) + count;
  }
  
  // Remove change denominations
  for (const [denom, count] of Object.entries(change)) {
    updated[denom] = (updated[denom] || 0) - count;
  }
  
  return updated;
}

/**
 * Initialize empty register with all denominations
 * @returns {Object} - Empty register state
 */
export function initializeRegister() {
  const register = {};
  DENOMINATIONS.forEach(denom => {
    register[denom.toString()] = 0;
  });
  return register;
}

/**
 * Validate register state
 * @param {Object} registerState - Register state to validate
 * @returns {boolean} - True if valid
 */
export function validateRegister(registerState) {
  for (const [denom, count] of Object.entries(registerState)) {
    if (count < 0) {
      return false;
    }
    if (!DENOMINATIONS.includes(parseFloat(denom))) {
      return false;
    }
  }
  return true;
}
