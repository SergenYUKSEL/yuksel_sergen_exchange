// Cash Register Frontend Application

const DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05];

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
  initializeDenominationInputs();
  initializePreferredDenominations();
  loadRegisterState();
  attachEventListeners();
});

function initializeDenominationInputs() {
  const container = document.getElementById('givenDenominations');
  container.innerHTML = DENOMINATIONS.map(denom => `
    <div class="denomination-input">
      <label>${formatCurrency(denom)}</label>
      <input type="number" 
             id="given-${denom}" 
             min="0" 
             value="0" 
             data-denom="${denom}">
    </div>
  `).join('');
}

function initializePreferredDenominations() {
  const container = document.getElementById('preferredDenominations');
  container.innerHTML = DENOMINATIONS.map(denom => `
    <label>
      <input type="checkbox" value="${denom}">
      ${formatCurrency(denom)}
    </label>
  `).join('');
}

function attachEventListeners() {
  document.getElementById('calculateBtn').addEventListener('click', calculateChange);
  document.getElementById('refreshRegisterBtn').addEventListener('click', loadRegisterState);
  document.getElementById('resetRegisterBtn').addEventListener('click', resetRegister);
  
  document.getElementById('strategy').addEventListener('change', (e) => {
    const preferredGroup = document.getElementById('preferredGroup');
    preferredGroup.style.display = e.target.value === 'preferred' ? 'block' : 'none';
  });
}

async function calculateChange() {
  const amountDue = parseFloat(document.getElementById('amountDue').value);
  
  if (!amountDue || amountDue <= 0) {
    showError('Veuillez entrer un montant dû valide');
    return;
  }
  
  // Collect given denominations
  const totalGiven = {};
  DENOMINATIONS.forEach(denom => {
    const input = document.getElementById(`given-${denom}`);
    const count = parseInt(input.value) || 0;
    if (count > 0) {
      totalGiven[denom.toString()] = count;
    }
  });
  
  if (Object.keys(totalGiven).length === 0) {
    showError('Veuillez entrer le montant donné par le client');
    return;
  }
  
  const strategy = document.getElementById('strategy').value;
  const preferredDenominations = strategy === 'preferred' 
    ? Array.from(document.querySelectorAll('#preferredDenominations input:checked'))
        .map(cb => parseFloat(cb.value))
    : [];
  
  try {
    const response = await fetch('/api/calculate-change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountDue,
        totalGiven,
        strategy,
        preferredDenominations
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      displayResult(data);
      loadRegisterState();
    } else {
      showError(data.error);
    }
  } catch (error) {
    showError('Erreur de communication avec le serveur');
  }
}

async function loadRegisterState() {
  try {
    const response = await fetch('/api/register-state');
    const data = await response.json();
    
    if (data.success) {
      displayRegisterState(data.register);
    }
  } catch (error) {
    console.error('Error loading register state:', error);
  }
}

async function resetRegister() {
  if (!confirm('Êtes-vous sûr de vouloir réinitialiser la caisse ?')) {
    return;
  }
  
  try {
    const response = await fetch('/api/reset-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (data.success) {
      displayRegisterState(data.register);
      showSuccess('Caisse réinitialisée avec succès');
    }
  } catch (error) {
    showError('Erreur lors de la réinitialisation');
  }
}

function displayResult(data) {
  const resultDiv = document.getElementById('result');
  const changeItems = Object.entries(data.change)
    .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
    .map(([denom, count]) => `
      <div class="change-item">
        <div class="denom">${formatCurrency(parseFloat(denom))}</div>
        <div class="count">× ${count}</div>
      </div>
    `).join('');
  
  resultDiv.innerHTML = `
    <div class="result-success">
      <div class="result-info">
        <strong>Montant à rendre:</strong> ${formatCurrency(data.changeAmount)} TL
      </div>
      <h3>Rendu de monnaie:</h3>
      <div class="change-display">
        ${changeItems || '<p>Aucune monnaie à rendre</p>'}
      </div>
    </div>
  `;
}

function displayRegisterState(register) {
  const container = document.getElementById('registerState');
  const items = DENOMINATIONS.map(denom => {
    const count = register[denom.toString()] || 0;
    return `
      <div class="register-item">
        <div class="denom">${formatCurrency(denom)}</div>
        <div class="count">${count}</div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = items;
}

function showError(message) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = `
    <div class="result-error">
      <strong>Erreur:</strong> ${message}
    </div>
  `;
}

function showSuccess(message) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = `
    <div class="result-success">
      ${message}
    </div>
  `;
  setTimeout(() => {
    resultDiv.innerHTML = '<p class="placeholder">Effectuez une transaction pour voir le résultat</p>';
  }, 3000);
}

function formatCurrency(amount) {
  return `${amount.toFixed(2)} TL`;
}
