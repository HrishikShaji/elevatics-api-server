import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export class AgentsController {
	// GET /api/agents
	static async getAgents(url: URL): Promise<Response> {
		try {
			// Debug logging to understand what's being passed
			console.log('URL object:', url);
			console.log('URL type:', typeof url);
			console.log('URL searchParams:', url?.searchParams);

			// Handle case where url might be a string or malformed
			let searchParams: URLSearchParams;

			if (url instanceof URL) {
				searchParams = url.searchParams;
			} else if (typeof url === 'string') {
				const urlObj = new URL(url);
				searchParams = urlObj.searchParams;
			} else {
				// If url is actually a Request object or something else
				const urlObj = new URL((url as any)?.url || url);
				searchParams = urlObj.searchParams;
			}

			// Extract pagination parameters
			const page = parseInt(searchParams.get('page') || '1');
			const limit = parseInt(searchParams.get('limit') || '12');
			const skip = (page - 1) * limit;

			// Extract filter parameters
			const search = searchParams.get('search') || '';
			const isActive = searchParams.get('filter'); // 'active', 'inactive', or 'all'
			const sort = searchParams.get('sort') || 'createdAt';
			const order = searchParams.get('order') || 'desc';

			// Build where clause
			const where: any = {};

			// Search filter (searches in name, displayName, and description)
			if (search) {
				where.OR = [
					{ name: { contains: search, mode: 'insensitive' } },
					{ displayName: { contains: search, mode: 'insensitive' } },
					{ description: { contains: search, mode: 'insensitive' } }
				];
			}

			// Active/Inactive filter
			if (isActive && isActive !== 'all') {
				where.isActive = isActive === 'active';
			}

			// Build orderBy clause based on your schema fields
			const getOrderBy = (sortField: string, sortOrder: string) => {
				const orderObj: any = {};
				switch (sortField) {
					case 'displayName':
						orderObj.displayName = sortOrder;
						break;
					case 'createdAt':
						orderObj.createdAt = sortOrder;
						break;
					case 'updatedAt':
						orderObj.updatedAt = sortOrder;
						break;
					default:
						orderObj.createdAt = 'desc';
				}
				return orderObj;
			};

			const orderBy = getOrderBy(sort, order);

			// Execute queries in parallel for better performance
			const [agents, totalAgents] = await Promise.all([
				prisma.agent.findMany({
					where,
					orderBy,
					skip,
					take: limit,
					include: {
						_count: {
							select: {
								conversations: true,
								messages: true,
							},
						},
					},
				}),
				prisma.agent.count({ where })
			]);

			// Calculate pagination metadata
			const totalPages = Math.ceil(totalAgents / limit);
			const hasNext = page < totalPages;
			const hasPrev = page > 1;

			// Transform data to match your frontend expectations
			const response = {
				agents,
				pagination: {
					currentPage: page,
					totalPages,
					totalAgents,
					hasNext,
					hasPrev,
					limit
				}
			};

			return Response.json(response);
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
