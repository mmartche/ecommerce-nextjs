#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_DIR="$HOME/ecommerce-nextjs"
COMPOSE_FILE="docker-compose.prod.yml"

echo "=== Loja da Fumaca deployment ==="

cd "$PROJECT_DIR"

if [[ ! -f .env ]]; then
    echo "ERRO: ficheiro .env não encontrado."
    exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "ERRO: existem alterações locais no repositório."
    git status --short
    exit 1
fi

PREVIOUS_COMMIT=$(git rev-parse --short HEAD)

echo "Versão atual: $PREVIOUS_COMMIT"
echo "Baixando atualizações..."

BRANCH=$(git branch --show-current)

if [[ -z "$BRANCH" ]]; then
    echo "ERRO: o repositório está em detached HEAD."
    exit 1
fi

echo "Branch: $BRANCH"

git fetch origin "$BRANCH"
git pull --ff-only origin "$BRANCH"

CURRENT_COMMIT=$(git rev-parse --short HEAD)

echo "Nova versão: $CURRENT_COMMIT"
echo "Validando Docker Compose..."

docker compose -f "$COMPOSE_FILE" config --quiet

echo "Construindo API e frontend..."

docker compose -f "$COMPOSE_FILE" build --pull api nextjs

echo "Sincronizando o schema do banco..."

docker compose -f "$COMPOSE_FILE" run --rm api npx prisma db push

echo "Atualizando containers..."

docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

echo "Aguardando a aplicação..."

API_READY=false
FRONTEND_READY=false

for attempt in {1..20}; do
    if curl --fail --silent http://127.0.0.1:4000/api/products > /dev/null; then
        API_READY=true
        break
    fi

    sleep 3
done

for attempt in {1..20}; do
    if curl --fail --silent --head http://127.0.0.1:3000 > /dev/null; then
        FRONTEND_READY=true
        break
    fi

    sleep 3
done

if [[ "$API_READY" != true || "$FRONTEND_READY" != true ]]; then
    echo "ERRO: a aplicação não passou nos testes."
    echo "Versão anterior: $PREVIOUS_COMMIT"
    echo "Versão atual: $CURRENT_COMMIT"

    docker compose -f "$COMPOSE_FILE" ps
    docker compose -f "$COMPOSE_FILE" logs --tail=50 api nextjs

    exit 1
fi

docker compose -f "$COMPOSE_FILE" ps

echo "Deploy concluído com sucesso."
echo "Frontend: https://lojadafumaca.com"
echo "API: https://api.lojadafumaca.com/api/products"
