# E-commerce Docker

Stack:
- Next.js + React
- Node.js API
- PostgreSQL
- Prisma
- Adminer
- Docker Compose

## Start

```bash
docker-compose up -d
```

## Logs

```bash
docker logs -f ecommerce-nextjs
docker logs -f ecommerce-api
```

## Restart API
```bash
docker-compose restart api
```

Open:
- Next.js: http://localhost:3000
- API health: http://localhost:4000/health
- Adminer: http://localhost:8000

Adminer connection:
- System: PostgreSQL
- Server: postgres
- Username: ecommerce
- Password: ecommerce
- Database: ecommerce

## Prisma

After the containers are running:

```bash
docker-compose exec api npx prisma generate
docker-compose exec api npx prisma migrate dev --name init
docker-compose exec api npx prisma migrate dev --name product_customization
```

To database delete:
```bash
docker-compose run --rm api npx prisma migrate dev --name init
```