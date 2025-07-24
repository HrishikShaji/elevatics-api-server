import { PrismaClient } from "../generated/prisma";

interface Props {
	page: number;
	pageSize: number;
	status: string;
	sortBy: string;
	sortOrder: string;
}

const prisma = new PrismaClient()

export default async function getLogsFromDB({ page, pageSize, sortOrder, sortBy, status }: Props) {
	const offset = (page - 1) * pageSize

	const whereClause: any = {}


	if (status && status !== 'ALL') {
		whereClause.status = status
	}

	let orderBy: any = {}
	if (sortBy === 'createdAt') {
		orderBy = { createdAt: sortOrder }
	} else {
		orderBy = { [sortBy]: sortOrder }
	}


	const [logs, totalCount] = await Promise.all([
		prisma.log.findMany({
			where: whereClause,
			orderBy,
			skip: offset,
			take: pageSize,
		}),
		prisma.log.count({
			where: whereClause,
		})

	])


	return { logs, totalCount }

}
