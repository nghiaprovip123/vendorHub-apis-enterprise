import { typeDefs } from './typeDefs';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import { resolvers } from './resolvers/merge-resolvers';
import dotenv from "dotenv";
import { graphqlUploadExpress } from 'graphql-upload-minimal';
import { logger, createContextLogger } from './lib/logger';
import morgan from 'morgan';
import AuthRouter from '@/auth/routes/auth.route';
import { errorHandler } from '@/common/guards/error.guard';
import cookieParser from "cookie-parser";
import { apiLimiter } from "@/common/guards/rate-limiter";
import { pubsub } from '@/pubsub/pubsub';
import { startBookingStatusCron } from "@/booking/cron/booking.cron";
import './mcp/http-server'; // ← 1 lần duy nhất
import { connectRedis } from '@/lib/redis';
import { board }  from '@/lib/bull-dashboard'

dotenv.config();

(async function () {
  const PORT = Number(process.env.PORT) || 3000;
  const app = express();

  // ── Middleware cơ bản ────────────────────────────────────
  app.use(express.json());
  app.use(cookieParser());
  const allowedOrigins = [
    'https://my-core-is-business.vercel.app',  // prod
    'http://vh.local:3001',                     // local
    'http://localhost:3000',                    // local
    'http://localhost:3001',                    // local
  ];
  
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
  // Request ID
  app.use((req: any, res, next) => {
    req.id = Math.random().toString(36).substring(7);
    res.setHeader('X-Request-ID', req.id);
    next();
  });

  // Morgan logging
  morgan.token('request-id', (req: any) => req.id);
  app.use(
    morgan((tokens, req: any, res) => {
      return JSON.stringify({
        type: 'http_access',
        request_id: req.id,
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: Number(tokens.status(req, res)),
        response_time_ms: Number(tokens['response-time'](req, res)),
        content_length: tokens.res(req, res, 'content-length'),
        user_agent: tokens['user-agent'](req, res),
        ip: tokens['remote-addr'](req, res),
      });
    }, {
      stream: {
        write: (message: string) => {
          logger.info('http_request', JSON.parse(message));
        },
      },
    })
  );

  // ── Bull Board ───────────────────────────────────────────
  await board(app)
  // ── Redis ────────────────────────────────────────────────
  await connectRedis();

  // ── GraphQL Schema ───────────────────────────────────────
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const httpServer = createServer(app);

  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });
  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  // ── Routes ───────────────────────────────────────────────
  app.get('/health', (req, res) => res.status(200).send('OK'));
  app.use('/auth', apiLimiter, AuthRouter);

  // graphqlUploadExpress TRƯỚC expressMiddleware
  app.use(graphqlUploadExpress({ maxFileSize: 5_000_000, maxFiles: 5 }));

  app.use(
    '/graphql',
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req, res }: any) => ({
        req,
        res,
        pubsub,
        logger: createContextLogger({ request_id: req.id }),
        requestId: req.id,
      }),
    })
  );

  app.use(errorHandler);

  // ── Start ────────────────────────────────────────────────
  httpServer.listen(PORT, '0.0.0.0', () => {
    logger.info('Server started', {
      port: PORT,
      env: process.env.NODE_ENV,
      graphql: '/graphql',
      bullBoard: '/bull-board',
      loki_enabled: !!process.env.GRAFANA_LOKI_URL,
    });
  });

  startBookingStatusCron();
})();