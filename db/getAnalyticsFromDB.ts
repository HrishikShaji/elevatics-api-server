import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient()

interface Props {
	agentId: string | null;
	startDate: string | null;
	endDate: string | null;
	limit: number;
}

export default async function getAnalyticsFromDB({
	agentId,
	startDate,
	endDate,
	limit
}: Props) {
	const analytics = await prisma.chatAnalytics.findMany({
		where: {
			...(agentId && { agentId }),
			...(startDate && endDate && {
				date: {
					gte: new Date(startDate),
					lte: new Date(endDate),
				},
			}),
		},
		include: {
			agent: {
				select: { id: true, name: true, displayName: true },
			},
		},
		orderBy: { date: 'desc' },
		take: limit,
	});

	return analytics

}
