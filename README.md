# VendorHub Back Office API

> A comprehensive GraphQL API for VendorHub back office management system with schedule management, staff administration, and audit tracking.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![GraphQL](https://img.shields.io/badge/GraphQL-16.x-E10098.svg)](https://graphql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748.svg)](https://www.prisma.io/)
[![Apollo Server](https://img.shields.io/badge/Apollo%20Server-4.x-311C87.svg)](https://www.apollographql.com/)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [File Upload](#file-upload)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Features

- **JWT Authentication** - Access & refresh token with RSA encryption
- **Schedule Management** - Create, update, and track class/exam schedules
- **Staff Management** - Staff CRUD with avatar uploads to Cloudinary
- **Audit Logging** - Complete audit trail for bulk operations
- **File Upload** - GraphQL multipart upload support
- **Real-time Subscriptions** - WebSocket support via graphql-ws
- **Localization** - Multi-language support (en, vi, jp)
- **Role-Based Access Control** - Granular permissions system
- **Structured Logging** - JSON logging with Grafana Loki integration
- **GraphQL API** - Type-safe API with Apollo Server

---

## Tech Stack

### Core
- **Runtime:** Node.js 18.x
- **Language:** TypeScript 5.x
- **API:** GraphQL (Apollo Server 4.x)
- **Database:** MongoDB with Prisma ORM
- **Authentication:** JWT (jsonwebtoken, RSA keys)

### Key Libraries
- **Web Framework:** Express.js
- **GraphQL Tools:** @graphql-tools/schema, graphql-upload-minimal
- **Real-time:** graphql-ws, ws (WebSocket)
- **File Storage:** Cloudinary
- **Validation:** Zod
- **Logging:** Winston, winston-loki
- **Security:** bcrypt, cookie-parser, cors

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **MongoDB** >= 6.0 (local or cloud instance)
- **Cloudinary Account** (for file uploads)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/vendorhub-backoffice-api.git
cd vendorhub-backoffice-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="mongodb://localhost:27017/vendorhub"

# JWT Keys (Generate with: ssh-keygen -t rsa -b 2048)
JWT_ACCESS_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_ACCESS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWT_REFRESH_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_REFRESH_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWT_RESET_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_RESET_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Logging (Optional)
GRAFANA_LOKI_URL=http://localhost:3100

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Generate RSA Keys

```bash
# Generate Access Token Keys
ssh-keygen -t rsa -b 2048 -m PEM -f jwtAccessRS256.key
openssl rsa -in jwtAccessRS256.key -pubout -outform PEM -out jwtAccessRS256.key.pub

# Generate Refresh Token Keys
ssh-keygen -t rsa -b 2048 -m PEM -f jwtRefreshRS256.key
openssl rsa -in jwtRefreshRS256.key -pubout -outform PEM -out jwtRefreshRS256.key.pub

# Generate Reset Token Keys
ssh-keygen -t rsa -b 2048 -m PEM -f jwtResetRS256.key
openssl rsa -in jwtResetRS256.key -pubout -outform PEM -out jwtResetRS256.key.pub
```

Copy the contents to your `.env` file with `\n` for newlines.

---

## Database Setup

### 1. Push Prisma schema to database

```bash
npx prisma db push
```

### 2. Seed database (optional)

```bash
npm run seed
```

### 3. Open Prisma Studio (optional)

```bash
npx prisma studio
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```

Server runs on `http://localhost:3000`

GraphQL Playground: `http://localhost:3000/graphql`

### Production Mode

```bash
# Build
npm run build

# Start
npm start
```

### Docker

```bash
# Build image
docker build -t vendorhub-api .

# Run container
docker run -p 3000:3000 --env-file .env vendorhub-api
```

---

## Project Structure

```
src/
├── auth/                      # Authentication module
│   ├── controllers/           # Auth controllers
│   ├── services/              # Auth business logic
│   ├── routes/                # Express routes
│   └── dto/                   # Data transfer objects
├── staff/                     # Staff management module
│   ├── controllers/
│   ├── services/
│   ├── resolvers/             # GraphQL resolvers
│   ├── repositories/          # Data access layer
│   ├── dto/                   # Validation schemas
│   └── schema/                # GraphQL type definitions
├── schedule/                  # Schedule management module
│   ├── models/                # Mongoose models
│   ├── services/
│   ├── resolvers/
│   └── schema/
├── common/                    # Shared utilities
│   ├── guards/                # Auth & role guards
│   ├── jwt/                   # JWT utilities
│   ├── utils/                 # Helper functions
│   │   ├── cloudinary-orchestration.utils.ts
│   │   ├── cookie.utils.ts
│   │   └── error/
│   └── decorators/
├── lib/                       # External integrations
│   ├── prisma.ts              # Prisma client
│   └── logger.ts              # Winston logger
├── graphql/                   # GraphQL setup
│   ├── typeDefs.ts            # Merged type definitions
│   ├── resolvers/             # Merged resolvers
│   └── context.ts             # GraphQL context
└── index.ts                   # Application entry point
```

---

## API Documentation

### GraphQL Endpoint

```
POST http://localhost:3000/graphql
```

**Headers:**

```
Content-Type: application/json
apollo-require-preflight: true
Authorization: Bearer <access_token>
```

### REST Endpoints

```
POST   /auth/sign-in           # User login
POST   /auth/sign-up           # User registration
POST   /auth/refresh           # Refresh access token
POST   /auth/sign-out          # User logout
POST   /auth/forgot-password   # Request password reset
POST   /auth/reset-password    # Reset password with token
```

### Sample GraphQL Queries

#### Create Staff

```graphql
mutation CreateStaff($input: CreateStaffInput!) {
  createStaff(input: $input) {
    id
    fullName
    avatar_url
    timezone
    isActive
    workingHours {
      id
      day
      startTime
      endTime
    }
  }
}
```

**Variables:**

```json
{
  "input": {
    "fullName": "John Doe",
    "timezone": "Asia/Ho_Chi_Minh",
    "isActive": true,
    "workingHours": [
      { "day": "MONDAY", "startTime": "09:00", "endTime": "17:00" },
      { "day": "FRIDAY", "startTime": "09:00", "endTime": "17:00" }
    ]
  }
}
```

#### Update Staff

```graphql
mutation UpdateStaff($input: UpdateStaffInput!) {
  updateStaff(input: $input) {
    id
    fullName
    avatar_url
    timezone
    workingHours {
      day
      startTime
      endTime
    }
  }
}
```

#### Get Staff List

```graphql
query GetStaffList($input: GetStaffListInput!) {
  getStaffList(input: $input) {
    items {
      id
      fullName
      avatar_url
      timezone
      isActive
    }
    total
  }
}
```

### GraphQL Schema Explorer

Access GraphQL Playground at `http://localhost:3000/graphql` to explore the full schema with auto-complete and documentation.

---

## Authentication

### Flow

1. **Sign Up/Sign In** → Receive `accessToken` (15min) & `refreshToken` (7 days in httpOnly cookie)
2. **API Requests** → Include `Authorization: Bearer <accessToken>`
3. **Token Expired** → Call `/auth/refresh` with refresh token
4. **Sign Out** → Call `/auth/sign-out` to invalidate refresh token

### Guards

#### Express Routes

```typescript
import { AuthGuard } from '@/common/guards/auth.guard';

router.get('/protected', AuthGuard.RequireAuth, controller);
router.post('/admin', AuthGuard.RequireAuth, AuthGuard.requireRole('ADMIN'), controller);
```

#### GraphQL Resolvers

```typescript
import { GraphQLAuthGuard } from '@/common/guards/graphql-auth.guard';

export const createStaff = GraphQLAuthGuard.requireAuth(
  async (_, args, ctx) => {
    // ctx.user is available
    return createStaffService(args.input);
  }
);
```

---

## File Upload

### GraphQL File Upload (Multipart)

```bash
curl --location 'http://localhost:3000/graphql' \
  --header 'apollo-require-preflight: true' \
  --form 'operations={"query":"mutation CreateStaff($input: CreateStaffInput!) { createStaff(input: $input) { id avatar_url } }","variables":{"input":{"fullName":"Test","timezone":"Asia/Ho_Chi_Minh","avatar":null,"workingHours":[{"day":"MONDAY","startTime":"09:00","endTime":"17:00"}]}}}' \
  --form 'map={"0":["variables.input.avatar"]}' \
  --form '0=@"/path/to/image.png"'
```

### Cloudinary Integration

Files are uploaded to Cloudinary with structure:

```
{env}/staffs/{staffId}/avatar
```

- Development: `dev/staffs/abc123/avatar`
- Production: `prod/staffs/abc123/avatar`

---

## Testing

### Run Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Example Test

```typescript
import { createStaffService } from '@/staff/services/create-staff.service';

describe('Staff Service', () => {
  it('should create staff successfully', async () => {
    const input = {
      fullName: 'Test Staff',
      timezone: 'Asia/Ho_Chi_Minh',
      workingHours: [
        { day: 'MONDAY', startTime: '09:00', endTime: '17:00' }
      ]
    };
    
    const result = await createStaffService(input);
    expect(result).toHaveProperty('id');
    expect(result.fullName).toBe('Test Staff');
  });
});
```

---

## Deployment

### Environment-specific builds

```bash
# Staging
NODE_ENV=staging npm run build
npm start

# Production
NODE_ENV=production npm run build
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/index.js --name vendorhub-api

# View logs
pm2 logs vendorhub-api

# Restart
pm2 restart vendorhub-api
```

---

## Monitoring & Logging

### Grafana Loki Integration

Logs are sent to Grafana Loki for centralized monitoring:

```typescript
// Automatic structured logging
logger.info('User signed in', {
  userId: user.id,
  email: user.email,
  ip: req.ip
});
```

### Health Check

```
GET http://localhost:3000/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-01-28T12:00:00.000Z",
  "uptime": 3600
}
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **Linting:** ESLint with TypeScript rules
- **Formatting:** Prettier
- **Commits:** Conventional Commits format

```bash
# Run linter
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Team

- **Backend Team Lead:** [Your Name]
- **Contributors:** See [CONTRIBUTORS.md](CONTRIBUTORS.md)

---

## Support

- **Documentation:** [docs.vendorhub.com](https://docs.vendorhub.com)
- **Issues:** [GitHub Issues](https://github.com/your-org/vendorhub-backoffice-api/issues)
- **Email:** support@vendorhub.com
- **Slack:** #vendorhub-backend

---

## Roadmap

- [ ] Add rate limiting
- [ ] Implement caching with Redis
- [ ] Add email notifications
- [ ] Integrate with message queue (RabbitMQ/Kafka)
- [ ] Add comprehensive API documentation (OpenAPI/Swagger for REST)
- [ ] Implement database migrations
- [ ] Add performance monitoring (New Relic/DataDog)
- [ ] Set up CI/CD pipeline

---

Made with ❤️ by the VendorHub Team