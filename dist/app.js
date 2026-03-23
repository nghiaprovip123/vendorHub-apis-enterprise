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
require("./mcp/http-server"); // ← 1 lần duy nhất
const redis_1 = require("./lib/redis");
const bull_dashboard_1 = require("./lib/bull-dashboard");
dotenv_1.default.config();
(async function () {
    const PORT = Number(process.env.PORT) || 3000;
    const app = (0, express_1.default)();
    // ── Middleware cơ bản ────────────────────────────────────
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use((0, cors_1.default)({ origin: true, credentials: true })); // 1 lần duy nhất
    // Request ID
    app.use((req, res, next) => {
        req.id = Math.random().toString(36).substring(7);
        res.setHeader('X-Request-ID', req.id);
        next();
    });
    // Morgan logging
    morgan_1.default.token('request-id', (req) => req.id);
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
    // ── Bull Board ───────────────────────────────────────────
    await (0, bull_dashboard_1.board)(app);
    // ── Redis ────────────────────────────────────────────────
    await (0, redis_1.connectRedis)();
    // ── GraphQL Schema ───────────────────────────────────────
    const schema = (0, schema_1.makeExecutableSchema)({ typeDefs: typeDefs_1.typeDefs, resolvers: merge_resolvers_1.resolvers });
    const httpServer = (0, http_1.createServer)(app);
    const wsServer = new ws_1.WebSocketServer({ server: httpServer, path: '/graphql' });
    const serverCleanup = (0, ws_2.useServer)({ schema }, wsServer);
    const server = new server_1.ApolloServer({
        schema,
        plugins: [
            (0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer }),
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
    app.use('/auth', rate_limiter_1.apiLimiter, auth_route_1.default);
    // graphqlUploadExpress TRƯỚC expressMiddleware
    app.use((0, graphql_upload_minimal_1.graphqlUploadExpress)({ maxFileSize: 5000000, maxFiles: 5 }));
    app.use('/graphql', body_parser_1.default.json(), (0, express4_1.expressMiddleware)(server, {
        context: async ({ req, res }) => ({
            req,
            res,
            pubsub: pubsub_1.pubsub,
            logger: (0, logger_1.createContextLogger)({ request_id: req.id }),
            requestId: req.id,
        }),
    }));
    app.use(error_guard_1.errorHandler);
    // ── Start ────────────────────────────────────────────────
    httpServer.listen(PORT, '0.0.0.0', () => {
        logger_1.logger.info('Server started', {
            port: PORT,
            env: process.env.NODE_ENV,
            graphql: '/graphql',
            bullBoard: '/bull-board',
            loki_enabled: !!process.env.GRAFANA_LOKI_URL,
        });
    });
    (0, booking_cron_1.startBookingStatusCron)();
})();
