# 💰 Cash Register System

A professional cash register system with change calculation, built with Node.js, Express, and EJS.

## Features

- **Change Calculation**: Automatically calculates change for transactions
- **Multiple Strategies**: 
  - Max Large: Returns largest denominations first (default)
  - Max Small: Returns smallest denominations first
  - Preferred: Prioritizes specific denominations
- **Real-time Register Management**: Track cash register state
- **Comprehensive Testing**: Unit, functional, and E2E tests
- **CI/CD Pipeline**: Automated testing with GitHub Actions

## Installation

```bash
npm install
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit        # Unit tests
npm run test:functional  # Functional tests
npm run test:e2e         # End-to-end tests

# Generate coverage report
npm run test:coverage
```

## API Endpoints

### POST /api/calculate-change
Calculate change for a transaction.

**Request:**
```json
{
  "amountDue": 123,
  "totalGiven": {
    "200": 1
  },
  "strategy": "maxLarge",
  "preferredDenominations": [50, 20, 10]
}
```

**Response:**
```json
{
  "success": true,
  "changeAmount": 77,
  "change": {
    "50": 1,
    "20": 1,
    "5": 1,
    "2": 1
  },
  "updatedRegister": { ... }
}
```

### GET /api/register-state
Get current cash register state.

### POST /api/reset-register
Reset cash register to initial or custom state.

## Project Structure

```
├── src/
│   ├── services/
│   │   └── cashRegister.js    # Business logic
│   ├── routes/
│   │   └── cashRegister.js    # API routes
│   └── app.js                 # Express server
├── views/
│   └── index.ejs              # Frontend interface
├── public/
│   ├── app.js                 # Frontend JavaScript
│   └── styles.css             # Styles
├── tests/
│   ├── unit/                  # Unit tests
│   ├── functional/            # Functional tests
│   └── e2e/                   # End-to-end tests
└── .github/
    └── workflows/
        └── ci.yml             # CI/CD pipeline
```

## Denominations Supported

- Coins: 0.05, 0.10, 0.20, 0.50, 1, 2 TL
- Notes: 5, 10, 20, 50, 100, 200, 500 TL

## Example Scenarios

### Scenario 1: Basic Transaction
- Customer owes: 123 TL
- Customer gives: 200 TL note
- Change: 77 TL (50 + 20 + 5 + 2)

### Scenario 2: Exact Payment
- Customer owes: 25 TL
- Customer gives: 20 + 5 TL
- Change: 0 TL

### Scenario 3: Preferred Denominations
- Customer owes: 60 TL
- Customer gives: 100 TL
- Preferred: 20, 10 TL notes
- Change: 40 TL (20 + 20 or 20 + 10 + 10)

## Coding Conventions

- **Language**: English for all code references
- **Naming**: camelCase
- **ES Version**: ES6+
- **Testing**: Comprehensive unit, functional, and E2E tests

## CI/CD

The project includes a GitHub Actions workflow that:
- Runs tests on Node.js 18.x and 20.x
- Generates coverage reports
- Uploads coverage to Codecov
- Builds and archives production artifacts

## License

ISC
