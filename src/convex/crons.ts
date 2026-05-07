import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval('delete expired conversations', { minutes: 15 }, internal.chat.deleteExpiredConversations);
crons.interval(
	'delete expired builder sessions',
	{ minutes: 15 },
	internal.builderSessionMaintenance.deleteExpiredSessions
);

export default crons;
