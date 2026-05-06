import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval('delete expired conversations', { minutes: 15 }, internal.chat.deleteExpiredConversations);
crons.interval(
	'delete expired custom email runs',
	{ minutes: 15 },
	internal.customEmailMaintenance.deleteExpiredRuns
);

export default crons;
