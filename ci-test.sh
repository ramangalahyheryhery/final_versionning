#!/bin/bash
set -e

echo "=============================="
echo " STOP & CLEAN "
echo "=============================="

docker-compose down --remove-orphans
docker rm -f $(docker ps -aq) 2>/dev/null || true

echo "=============================="
echo " BUILD "
echo "=============================="

docker-compose build --no-cache

echo "=============================="
echo " RUN "
echo "=============================="

docker-compose up -d

echo "⏳ Attente des services..."
sleep 15

echo "=============================="
echo " TEST BACKEND "
echo "=============================="

BACK_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/weather/Paris)

if [ "$BACK_CODE" != "200" ]; then
  echo "❌ Backend FAIL (HTTP $BACK_CODE)"
  docker-compose logs backend
  exit 1
fi

echo "✅ Backend OK"

echo "=============================="
echo " TEST FRONTEND "
echo "=============================="

FRONT_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)

if [ "$FRONT_CODE" != "200" ]; then
  echo "❌ Frontend FAIL (HTTP $FRONT_CODE)"
  docker-compose logs frontend
  exit 1
fi

echo "✅ Frontend OK"

echo "=============================="
echo " ✅ ALL TESTS PASSED "
echo "=============================="
