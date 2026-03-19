🔑 Core Stack
● Framework: Express + Apollo Server (GraphQL + Subscriptions)
● Database: Polyglot
○ PostgreSQL → transactional, relations
○ MongoDB → flexible, read models
● ORM: Prisma (typed, schema-driven)
● Async: BullMQ + Redis + dashboard
● Security: JWT (RS256), hashing, rate limit, validation, argon2
● Observability: Winston + Loki + Grafana + request tracing
● CI/CD: GitHub Actions
● Infra: Docker + k3s (Kubernetes-ready)