# 💰 Cash Register System

[![CI/CD Pipeline](https://github.com/SergenYUKSEL/yuksel_sergen_exchange/actions/workflows/ci.yml/badge.svg)](https://github.com/SergenYUKSEL/yuksel_sergen_exchange/actions/workflows/ci.yml)
[![Docker Build](https://github.com/SergenYUKSEL/yuksel_sergen_exchange/actions/workflows/docker-build-push.yml/badge.svg)](https://github.com/SergenYUKSEL/yuksel_sergen_exchange/actions/workflows/docker-build-push.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=SergenYUKSEL_yuksel_sergen_exchange&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=SergenYUKSEL_yuksel_sergen_exchange)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=SergenYUKSEL_yuksel_sergen_exchange&metric=coverage)](https://sonarcloud.io/summary/new_code?id=SergenYUKSEL_yuksel_sergen_exchange)

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
- **Docker Support**: Containerized deployment

## Installation

### Local Development

```bash
npm install
npm start
```

The application will be available at `http://localhost:3000`

### Docker

#### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

#### Using Docker CLI

```bash
# Build image
docker build -t cash-register .

# Run container
docker run -d -p 3000:3000 --name cash-register-app cash-register
```

#### Pull from DockerHub

```bash
docker pull <your-dockerhub-username>/cash-register:latest
docker run -d -p 3000:3000 <your-dockerhub-username>/cash-register:latest
```

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

## Docker Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (production/development)

### Health Check

The Docker image includes a health check that verifies the API is responding:
- Interval: 30 seconds
- Timeout: 3 seconds
- Retries: 3

## CI/CD

### GitHub Actions Workflows

1. **CI/CD Pipeline** (`.github/workflows/ci.yml`)
   - Runs tests on Node.js 18.x and 20.x
   - Generates coverage reports
   - Builds artifacts

2. **Docker Build and Push** (`.github/workflows/docker-build-push.yml`)
   - Builds Docker image
   - Tests the image
   - Pushes to DockerHub on main/production branches

### Required GitHub Secrets

To enable DockerHub push, add these secrets to your repository:
- `DOCKERHUB_USERNAME`: Your DockerHub username
- `DOCKERHUB_TOKEN`: Your DockerHub access token

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
├── .github/
│   └── workflows/             # CI/CD pipelines
├── Dockerfile                 # Docker configuration
└── docker-compose.yml         # Docker Compose configuration
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

## Coding Conventions

- **Language**: English for all code references
- **Naming**: camelCase
- **ES Version**: ES6+
- **Testing**: Comprehensive unit, functional, and E2E tests

## License

ISC
