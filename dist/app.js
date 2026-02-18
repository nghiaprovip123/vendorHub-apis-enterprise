"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeDefs_1 = require("./typeDefs");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const ws_1 = require("ws");
const ws_2 = require("graphql-ws/lib/use/ws");
const schema_1 = require("@graphql-tools/schema");
const server_1 = require("@apollo/server");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const express4_1 = require("@as-integrations/express4");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const merge_resolvers_1 = require("./resolvers/merge-resolvers");
const dotenv_1 = __importDefault(require("dotenv"));
const graphql_upload_minimal_1 = require("graphql-upload-minimal");
const logger_1 = require("./lib/logger");
const morgan_1 = __importDefault(require("morgan"));
const auth_route_1 = __importDefault(require("./auth/routes/auth.route"));
const error_guard_1 = require("./common/guards/error.guard");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const rate_limiter_1 = require("./common/guards/rate-limiter");
const pubsub_1 = require("./pubsub/pubsub");
const booking_cron_1 = require("./booking/cron/booking.cron");
// import redisClient, { connectRedis, disconnectRedis } from './lib/redis';
dotenv_1.default.config();
(async function () {
    const PORT = Number(process.env.PORT) || 3000;
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use((req, res, next) => {
        req.id = Math.random().toString(36).substring(7);
        res.setHeader('X-Request-ID', req.id);
        next();
    });
    morgan_1.default.token('request-id', (req) => req.id);
    // await connectRedis();
    app.use((0, morgan_1.default)((tokens, req, res) => {
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
            write: (message) => {
                logger_1.logger.info('http_request', JSON.parse(message));
            },
        },
    }));
    const httpServer = (0, http_1.createServer)(app);
    app.use((0, cors_1.default)({
        origin: true,
        credentials: true,
    }));
    const schema = (0, schema_1.makeExecutableSchema)({ typeDefs: typeDefs_1.typeDefs, resolvers: merge_resolvers_1.resolvers });
    // ws Server
    const wsServer = new ws_1.WebSocketServer({
        server: httpServer,
        path: "/graphql" // localhost:3000/graphql
    });
    const serverCleanup = (0, ws_2.useServer)({ schema }, wsServer); // dispose
    // apollo server
    const server = new server_1.ApolloServer({
        schema,
        plugins: [
            (0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        }
                    };
                }
            }
        ]
    });
    await server.start();
    app.use((0, graphql_upload_minimal_1.graphqlUploadExpress)({
        maxFileSize: 5000000,
        maxFiles: 5,
    }));
    app.use('/auth', rate_limiter_1.apiLimiter, auth_route_1.default);
    app.use('/graphql', (0, cors_1.default)(), body_parser_1.default.json(), (0, express4_1.expressMiddleware)(server, {
        context: async ({ req, res }) => {
            const contextLogger = (0, logger_1.createContextLogger)({
                request_id: req.id,
            });
            return {
                req,
                res,
                pubsub: pubsub_1.pubsub,
                logger: contextLogger, // ← Add logger to context
                requestId: req.id,
            };
        }
    }));
    app.use(error_guard_1.errorHandler);
    httpServer.listen(PORT, "0.0.0.0", () => {
        logger_1.logger.info('Server started', {
            port: PORT,
            env: process.env.NODE_ENV,
            graphql: '/graphql',
            loki_enabled: !!process.env.GRAFANA_LOKI_URL,
        });
    });
    (0, booking_cron_1.startBookingStatusCron)(); // ✅ BẮT BUỘC
})();
