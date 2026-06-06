import { formatStarter as warmUp } from './warm-up';
import { formatStarter as whitespaceAnalysis } from './whitespace-analysis';
import { formatStarter as pitchContext } from './pitch-context';
import { formatStarter as callIntelligence } from './call-intelligence';
import { formatStarter as financeWhitespaceAnalysis } from './finance-whitespace-analysis';
import { formatStarter as techConsultingCallIntelligence } from './tech-consulting-call-intelligence';
import { formatStarter as topOfMind } from './top-of-mind';
import { formatStarter as reconnectLinkedin } from './reconnect-linkedin';

export const formatStarterEntries = [
	warmUp,
	whitespaceAnalysis,
	pitchContext,
	callIntelligence,
	financeWhitespaceAnalysis,
	techConsultingCallIntelligence,
	topOfMind,
	reconnectLinkedin
] as const;
