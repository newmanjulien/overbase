import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval(
	'delete expired builder sessions',
	{ minutes: 15 },
	internal.internal.builderSessions.deleteExpiredSessions
);

export default crons;
