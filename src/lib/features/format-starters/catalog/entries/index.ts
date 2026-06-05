import {
	callIntelligenceFormatStarter,
	techConsultingCallIntelligenceFormatStarter
} from './call-intelligence';
import { pitchContextFormatStarter } from './pitch-context';
import { reconnectLinkedinFormatStarter } from './reconnect-linkedin';
import { topOfMindFormatStarter } from './top-of-mind';
import { warmUpFormatStarter } from './warm-up';
import {
	financeWhitespaceAnalysisFormatStarter,
	whitespaceAnalysisFormatStarter
} from './whitespace-analysis';

export const formatStarterEntries = [
	warmUpFormatStarter,
	whitespaceAnalysisFormatStarter,
	pitchContextFormatStarter,
	callIntelligenceFormatStarter,
	financeWhitespaceAnalysisFormatStarter,
	techConsultingCallIntelligenceFormatStarter,
	topOfMindFormatStarter,
	reconnectLinkedinFormatStarter
] as const;
