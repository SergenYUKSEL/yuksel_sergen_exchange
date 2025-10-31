#!/bin/bash

# Script to test Docker image locally

set -e

echo "🐳 Building Docker image..."
docker build -t cash-register:test .

echo ""
echo "🚀 Starting container..."
docker run -d --name cash-register-test -p 3000:3000 cash-register:test

echo ""
echo "⏳ Waiting for container to be ready..."
sleep 5

echo ""
echo "🔍 Checking container status..."
if ! docker ps | grep cash-register-test; then
  echo "❌ Container failed to start"
  docker logs cash-register-test
  docker rm -f cash-register-test
  exit 1
fi

echo ""
echo "✅ Container is running!"

echo ""
echo "🧪 Testing API endpoints..."

# Test register state endpoint
echo "Testing GET /api/register-state..."
if curl -f http://localhost:3000/api/register-state > /dev/null 2>&1; then
  echo "✅ Register state endpoint working"
else
  echo "❌ Register state endpoint failed"
  docker logs cash-register-test
  docker rm -f cash-register-test
  exit 1
fi

# Test calculate change endpoint
echo "Testing POST /api/calculate-change..."
response=$(curl -s -X POST http://localhost:3000/api/calculate-change \
  -H "Content-Type: application/json" \
  -d '{"amountDue": 123, "totalGiven": {"200": 1}, "strategy": "maxLarge"}')

if echo "$response" | grep -q '"success":true'; then
  echo "✅ Calculate change endpoint working"
  echo "Response: $response"
else
  echo "❌ Calculate change endpoint failed"
  echo "Response: $response"
  docker logs cash-register-test
  docker rm -f cash-register-test
  exit 1
fi

# Test health check
echo ""
echo "🏥 Testing health check..."
sleep 5
health_status=$(docker inspect --format='{{.State.Health.Status}}' cash-register-test)
echo "Health status: $health_status"

echo ""
echo "📊 Container logs:"
docker logs cash-register-test

echo ""
echo "🧹 Cleaning up..."
docker stop cash-register-test
docker rm cash-register-test

echo ""
echo "✅ All tests passed! Docker image is ready."
echo ""
echo "To run the container:"
echo "  docker run -d -p 3000:3000 --name cash-register cash-register:test"
echo ""
echo "Or use docker-compose:"
echo "  docker-compose up -d"
