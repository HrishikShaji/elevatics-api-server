import { PrismaClient } from "../generated/prisma";

interface Props {
	page: number;
	limit: number;
	skip: number;
	search: string;
	status: string;
	sort: string;
	order: string;
}

const prisma = new PrismaClient()

export default async function getAgentsFromDB({
	page,
	limit,
	skip,
	search,
	sort,
	status,
	order
}: Props) {

	const where: any = {};

	if (search) {
		where.OR = [
			{ name: { contains: search, mode: 'insensitive' } },
			{ displayName: { contains: search, mode: 'insensitive' } },
			{ description: { contains: search, mode: 'insensitive' } }
		];
	}

	if (status && status !== 'all') {
		where.isActive = status === 'active';
	}

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


	return { agents, totalAgents }

}
