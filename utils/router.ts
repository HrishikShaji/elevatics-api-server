export class Router {
	private routes: Map<string, Map<string, Function>> = new Map();

	add(method: string, path: string, handler: Function) {
		if (!this.routes.has(method)) {
			this.routes.set(method, new Map());
		}
		this.routes.get(method)!.set(path, handler);
	}

	async handle(req: Request): Promise<Response | null> {
		const url = new URL(req.url);
		const method = req.method;
		const pathname = url.pathname;

		// Check exact matches first
		const methodRoutes = this.routes.get(method);
		if (!methodRoutes) return null;

		const handler = methodRoutes.get(pathname);
		if (handler) {
			return await handler(req, url);
		}

		// Check dynamic routes (e.g., /api/agents/:id)
		for (const [routePath, routeHandler] of methodRoutes) {
			const match = this.matchRoute(routePath, pathname);
			if (match) {
				return await routeHandler(req, url, match.params);
			}
		}

		return null;
	}

	private matchRoute(routePath: string, pathname: string) {
		const routeSegments = routePath.split('/');
		const pathSegments = pathname.split('/');

		if (routeSegments.length !== pathSegments.length) {
			return null;
		}

		const params: Record<string, string> = {};

		for (let i = 0; i < routeSegments.length; i++) {
			const routeSegment: any = routeSegments[i];
			const pathSegment = pathSegments[i];

			if (routeSegment.startsWith(':')) {
				// Dynamic segment
				const paramName = routeSegment.slice(1);
				params[paramName as any] = pathSegment as any;
			} else if (routeSegment !== pathSegment) {
				// Static segment mismatch
				return null;
			}
		}

		return { params };
	}
}
