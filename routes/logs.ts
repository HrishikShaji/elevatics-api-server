import getLogsFromDB from "../db/getLogsFromDB";

export class LogsController {
	static async getLogs(url: URL): Promise<Response> {
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

			const page = parseInt(searchParams.get('page') || '1')
			const pageSize = parseInt(searchParams.get('pageSize') || '10')
			const status = searchParams.get('status') || ''
			const sortBy = searchParams.get('sortBy') || 'createdAt'
			const sortOrder = searchParams.get('sortOrder') || "desc"


			const { logs, totalCount } = await getLogsFromDB({
				page,
				pageSize,
				status,
				sortBy,
				sortOrder
			})

			if (!logs || !totalCount) {
				return Response.json(
					{ error: 'Logs not found' },
					{ status: 404 }
				);
			}

			const totalPages = Math.ceil(totalCount / pageSize)
			const hasNextPage = page < totalPages
			const hasPreviousPage = page > 1

			const response = {
				data: logs,
				pagination: {
					page,
					pageSize,
					total: totalCount,
					totalPages,
					hasNextPage,
					hasPreviousPage,
				}
			}

			return Response.json(response);
		} catch (error) {
			console.error('Error fetching agents:', error);
			return Response.json(
				{ error: 'Failed to fetch agents' },
				{ status: 500 }
			);
		}
	}


}
