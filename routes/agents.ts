import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export class AgentsController {
	// GET /api/agents
	static async getAgents(url: URL): Promise<Response> {
		try {
			const isActive = url.searchParams.get('isActive');
			const name = url.searchParams.get('name');

			const agents = await prisma.agent.findMany({
				where: {
					...(isActive && { isActive: isActive === 'true' }),
					...(name && { name: { contains: name, mode: 'insensitive' } }),
				},
				include: {
					_count: {
						select: {
							conversations: true,
							messages: true,
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});

			return Response.json(agents);
		} catch (error) {
			console.error('Error fetching agents:', error);
			return Response.json(
				{ error: 'Failed to fetch agents' },
				{ status: 500 }
			);
		}
	}

	// POST /api/agents
	static async createAgent(req: Request): Promise<Response> {
		try {
			const body: any = await req.json();

			const agent = await prisma.agent.create({
				data: {
					name: body.name,
					displayName: body.displayName,
					description: body.description,
					avatar: body.avatar,
					model: body.model,
					systemPrompt: body.systemPrompt,
					capabilities: body.capabilities || [],
					isActive: body.isActive ?? true,
				},
			});

			return Response.json(agent, { status: 201 });
		} catch (error) {
			console.error('Error creating agent:', error);
			return Response.json(
				{ error: 'Failed to create agent' },
				{ status: 500 }
			);
		}
	}

	// GET /api/agents/:id
	static async getAgent(id: string): Promise<Response> {
		try {
			const agent = await prisma.agent.findUnique({
				where: { id },
				include: {
					_count: {
						select: {
							conversations: true,
							messages: true,
						},
					},
				},
			});

			if (!agent) {
				return Response.json(
					{ error: 'Agent not found' },
					{ status: 404 }
				);
			}

			return Response.json(agent);
		} catch (error) {
			console.error('Error fetching agent:', error);
			return Response.json(
				{ error: 'Failed to fetch agent' },
				{ status: 500 }
			);
		}
	}

	// PUT /api/agents/:id
	static async updateAgent(id: string, req: Request): Promise<Response> {
		try {
			const body: any = await req.json();

			const agent = await prisma.agent.update({
				where: { id },
				data: {
					name: body.name,
					displayName: body.displayName,
					description: body.description,
					avatar: body.avatar,
					model: body.model,
					systemPrompt: body.systemPrompt,
					capabilities: body.capabilities,
					isActive: body.isActive,
				},
			});

			return Response.json(agent);
		} catch (error) {
			console.error('Error updating agent:', error);
			return Response.json(
				{ error: 'Failed to update agent' },
				{ status: 500 }
			);
		}
	}

	// DELETE /api/agents/:id
	static async deleteAgent(id: string): Promise<Response> {
		try {
			await prisma.agent.delete({
				where: { id },
			});

			return Response.json({ message: 'Agent deleted successfully' });
		} catch (error) {
			console.error('Error deleting agent:', error);
			return Response.json(
				{ error: 'Failed to delete agent' },
				{ status: 500 }
			);
		}
	}
}
