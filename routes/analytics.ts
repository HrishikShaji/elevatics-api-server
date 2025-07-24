import getAnalyticsFromDB from "../db/getAnalyticsFromDB";

export class AnalyticsController {
	static async getAnalytics(url: URL): Promise<Response> {
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

			const agentId = searchParams.get('agentId');
			const startDate = searchParams.get('startDate');
			const endDate = searchParams.get('endDate');
			const limit = parseInt(searchParams.get('limit') || '30');


			const analytics = await getAnalyticsFromDB({
				agentId,
				startDate,
				endDate,
				limit
			})

			if (!analytics) {
				return Response.json(
					{ error: 'Analytics not found' },
					{ status: 404 }
				);
			}

			return Response.json(analytics);
		} catch (error) {
			console.error('Error fetching agents:', error);
			return Response.json(
				{ error: 'Failed to fetch agents' },
				{ status: 500 }
			);
		}
	}


}
