#!/bin/bash
set -e

echo " STOP & CLEAN "

# Arrête et supprime uniquement les conteneurs du projet
docker-compose down --remove-orphans

echo " BUILD le docker"

docker-compose build --no-cache

echo " RUN "
docker-compose up -d

echo "Attente des services... . . ."
sleep 15


echo " TEST BACKEND "
BACK_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/weather/Paris)

if [ "$BACK_CODE" != "200" ]; then
  echo "Backend FAIL (HTTP $BACK_CODE)"
  docker-compose logs backend
  exit 1
fi

echo "Backend OK"



echo " TEST FRONTEND "
FRONT_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)

if [ "$FRONT_CODE" != "200" ]; then
  echo " Frontend FAIL (HTTP $FRONT_CODE)"
  docker-compose logs frontend
  exit 1
fi

echo "Frontend OK"

echo " Tous les teste passe "

