import { AgentsController } from './routes/agents';
import { Router } from './utils/router';

const router = new Router();

// Register routes
router.add('GET', '/api/agents', AgentsController.getAgents);
router.add('POST', '/api/agents', AgentsController.createAgent);
router.add('GET', '/api/agents/:id', (req: Request, url: URL, params: any) =>
	AgentsController.getAgent(params.id)
);
router.add('PUT', '/api/agents/:id', (req: Request, url: URL, params: any) =>
	AgentsController.updateAgent(params.id, req)
);
router.add('DELETE', '/api/agents/:id', (req: Request, url: URL, params: any) =>
	AgentsController.deleteAgent(params.id)
);

const server = Bun.serve({
	port: 3001,
	async fetch(req) {
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
});

console.log(`🚀 Organized Bun API server running on http://localhost:${server.port}`);
