import express, { Request, Response, NextFunction } from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { getBookingListService } from '@/booking/services/get-booking-list.service';
import { getAvailableStaffbyBookingTimeService } from '@/staff/services/get-available-staff.service';
import { GetBookingListDto } from '@/booking/dto/booking.validation';

// ── Factory: tạo server instance mới cho mỗi SSE connection ──────────────────
function createServer() {
  const server = new Server(
    { name: 'vendorhub', version: '1.0.0' },
    { capabilities: { tools: {}, resources: {} } }
  );

  // List Tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'getAvailableStaff',
        description: 'Get available staff for a given date, start time, and duration',
        inputSchema: {
          type: 'object',
          properties: {
            date:            { type: 'string', description: 'Date in YYYY-MM-DD format' },
            startTime:       { type: 'string', description: 'Start time in HH:MM format' },
            durationMinutes: { type: 'number', description: 'Duration in minutes' },
          },
          required: ['date', 'startTime', 'durationMinutes'],
        },
      },
      {
        name: 'getBookingList',
        description: 'Get booking list for a date range, optionally filtered by staff',
        inputSchema: {
          type: 'object',
          properties: {
            startDate: { type: 'string', description: 'Start date YYYY-MM-DD' },
            endDate:   { type: 'string', description: 'End date YYYY-MM-DD' },
            staffId:   { type: 'string', description: 'Optional staff ID filter' },
          },
          required: ['startDate', 'endDate'],
        },
      },
    ],
  }));

  // Call Tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === 'getAvailableStaff') {
        const input = z.object({
          date:            z.string(),
          startTime:       z.string(),
          durationMinutes: z.number(),
        }).parse(args);

        const dayNum = new Date(input.date).getDay() || 7;
        const endTimeObj = new Date(
          new Date(`${input.date}T${input.startTime}:00`).getTime() +
          input.durationMinutes * 60 * 1000
        );
        const endTime = endTimeObj.toTimeString().slice(0, 5);

        const result = await getAvailableStaffbyBookingTimeService({
          day: dayNum,
          startTime: input.startTime,
          endTime,
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      if (name === 'getBookingList') {
        const input = z.object({
          startDate: z.string(),
          endDate:   z.string(),
          staffId:   z.string().optional(),
        }).parse(args);

        const result = await getBookingListService(input as z.infer<typeof GetBookingListDto>);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              bookings: result.bookingList,
              totals: {
                total:     result.total,
                pending:   result.totalPending,
                cancelled: result.totalCancelled,
                noShow:    result.totalNoShow,
              },
            }, null, 2),
          }],
        };
      }

      throw new Error(`Unknown tool: ${name}`);

    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  });

  // List Resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri:         'vendorhub://bookings/today',
        name:        "Today's Bookings",
        description: 'Live booking list for today',
        mimeType:    'application/json',
      },
    ],
  }));

  // Read Resource
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    if (uri === 'vendorhub://bookings/today') {
      const today = new Date().toISOString().split('T')[0];
      const result = await getBookingListService({ startDate: today, endDate: today });

      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(result.bookingList, null, 2),
        }],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  });

  return server;
}

// ── Express App ───────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());

// Auth middleware
const API_KEY = process.env.MCP_API_KEY ?? '';
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!API_KEY) {
    console.warn('WARNING: MCP_API_KEY is not set');
    return next();
  }
  const auth = req.headers['authorization'];
  if (!auth || auth !== `Bearer ${API_KEY}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
});

// SSE endpoint — Claude Desktop kết nối vào đây
const transports: Record<string, SSEServerTransport> = {};

app.get('/sse', async (req: Request, res: Response) => {
  const transport = new SSEServerTransport('/messages', res);
  transports[transport.sessionId] = transport;

  const server = createServer();
  await server.connect(transport);

  req.on('close', () => {
    delete transports[transport.sessionId];
  });
});

// Message endpoint — SSE transport dùng để nhận message từ client
app.post('/messages', async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];

  if (!transport) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  await transport.handlePostMessage(req, res);
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', sessions: Object.keys(transports).length });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.MCP_PORT ?? 3456);
app.listen(PORT, () => {
  console.log(`VendorHub MCP HTTP server running on port ${PORT}`);
});