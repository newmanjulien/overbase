import { callIntelligenceFormatStarter } from './call-intelligence';
import { pitchContextFormatStarter } from './pitch-context';
import { reconnectLinkedinFormatStarter } from './reconnect-linkedin';
import { topOfMindFormatStarter } from './top-of-mind';
import { warmUpFormatStarter } from './warm-up';
import { whitespaceAnalysisFormatStarter } from './whitespace-analysis';

export const formatStarterEntries = [
	warmUpFormatStarter,
	whitespaceAnalysisFormatStarter,
	pitchContextFormatStarter,
	callIntelligenceFormatStarter,
	topOfMindFormatStarter,
	reconnectLinkedinFormatStarter
] as const;
