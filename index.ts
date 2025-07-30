import { AgentsController } from './routes/agents';
import { AnalyticsController } from './routes/analytics';
import { LogsController } from './routes/logs';
import { Router } from './utils/router';

const router = new Router();

// Register routes
router.add('GET', '/api/agents', AgentsController.getAgents);
router.add('GET', '/api/agents/:id', (req: Request, url: URL, params: any) =>
	AgentsController.getAgent(params.id)
);
router.add('GET', '/api/logs', LogsController.getLogs);
router.add('GET', '/api/analytics', AnalyticsController.getAnalytics);

const server = Bun.serve({
	port: 3000,
	async fetch(req, server) {
		const url = new URL(req.url);

		// CORS headers
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};

		// Handle CORS preflight
		if (req.method === 'OPTIONS') {
			return new Response(null, {
				status: 200,
				headers: corsHeaders
			});
		}

		// Check if this is a WebSocket upgrade request
		const upgrade = req.headers.get('upgrade');
		if (upgrade === 'websocket') {
			const success = server.upgrade(req);
			if (success) {
				// Upgrade was successful, don't return a response
				return undefined;
			}
			// Upgrade failed
			return new Response('Upgrade failed', { status: 400 });
		}

		// Try to handle with router
		const response = await router.handle(req);
		if (response) {
			// Add CORS headers to successful responses
			const headers = new Headers(response.headers);
			Object.entries(corsHeaders).forEach(([key, value]) => {
				headers.set(key, value);
			});
			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers,
			});
		}

		// 404 - Route not found
		return new Response(
			JSON.stringify({ error: 'Route not found' }),
			{
				status: 404,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			}
		);
	},
	websocket: {
		message(ws, message) {
			try {
				const data = JSON.parse(message.toString());
				console.log('Received WebSocket message:', data);

				// Echo the message back to all connected clients
				server.publish('chat', JSON.stringify({
					type: 'message',
					data: data,
					timestamp: new Date().toISOString()
				}));
			} catch (error) {
				console.error('Error parsing WebSocket message:', error);
				ws.send(JSON.stringify({
					type: 'error',
					message: 'Invalid message format'
				}));
			}
		},
		open(ws) {
			console.log('WebSocket client connected');
			// Subscribe to the chat channel
			ws.subscribe('chat');
			// Send welcome message
			ws.send(JSON.stringify({
				type: 'welcome',
				message: 'Connected to WebSocket server!',
				timestamp: new Date().toISOString()
			}));
		},
		close(ws, code, message) {
			console.log('WebSocket client disconnected:', code, message);
			ws.unsubscribe('chat');
		},
	}
});

console.log(`🚀 Organized Bun API server running on http://localhost:${server.port}`);
