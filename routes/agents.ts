import getAgentFromDB from "../db/getAgentFromDB";
import getAgentsFromDB from "../db/getAgentsFromDB";

export class AgentsController {
	static async getAgents(url: URL): Promise<Response> {
		try {

			let searchParams: URLSearchParams;

			if (url instanceof URL) {
				searchParams = url.searchParams;
			} else if (typeof url === 'string') {
				const urlObj = new URL(url);
				searchParams = urlObj.searchParams;
			} else {
				const urlObj = new URL((url as any)?.url || url);
				searchParams = urlObj.searchParams;
			}

			const page = parseInt(searchParams.get('page') || '1');
			const limit = parseInt(searchParams.get('pageSize') || '12');
			const skip = (page - 1) * limit;
			const search = searchParams.get('search') || '';
			const status = searchParams.get('status') || "all";
			const sort = searchParams.get('sort') || 'createdAt';
			const order = searchParams.get('order') || 'desc';


			const { agents, totalAgents } = await getAgentsFromDB({
				page,
				limit,
				skip,
				search,
				status,
				sort,
				order
			})

			if (!agents || !totalAgents) {
				return Response.json(
					{ error: 'Agents not found' },
					{ status: 404 }
				);
			}

			const totalPages = Math.ceil(totalAgents / limit);

			const response = {
				data: agents,
				pagination: {
					page,
					pageSize: limit,
					total: totalAgents,
					totalPages
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

	static async getAgent(id: string): Promise<Response> {
		try {

			const agent = getAgentFromDB(id)

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

}
