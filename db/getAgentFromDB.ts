import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient()

export default async function getAgentFromDB(id: string) {
	const agent = await prisma.agent.findUnique({
		where: { id },
		include: {
			conversations: {
				include: {
					user: true,
					_count: {
						select: {
							messages: true,
						},
					},
				},
				orderBy: { updatedAt: 'desc' },
			},
			analytics: {
				orderBy: { date: 'desc' },
				take: 30,
			},
		},
	});

	return agent

}
