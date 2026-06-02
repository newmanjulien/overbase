import type { FormatVariableDefinition } from '$lib/features/format-starters/domain';
import type { FormatVariableDragCoordinator } from '$lib/features/format-starters/creator/variables/format-variable-drag-coordinator.svelte';
import type {
	EmailFormatContentEditPolicy,
	EmailFormatInlineTextContent,
	EmailFormatRulesEditPolicy
} from '$shared/email-format-definitions';
import type { EmailFormatRuleDataSourceAction } from '$shared/email-format-data-source-actions';
import type { EmailFormatConfigureState } from './email-format-configure-state.svelte';
import type {
	EmailFormatConfigureLoadState,
	EmailFormatRule
} from './email-format-configure-types';

export type EmailFormatConfigureSharedProps = {
	actionError: string | null;
	activationBlockerMessage: string | null;
	activationBlockerActionLabel?: string | null;
	activationReadyMessage: string | null;
	activationSuccessMessage: string | null;
	isUpdatingStatus: boolean;
	contentError: string | null;
	contentEditPolicy: EmailFormatContentEditPolicy | null;
	contentVariables: readonly FormatVariableDefinition[];
	configureState: EmailFormatConfigureState;
	dragCoordinator: FormatVariableDragCoordinator;
	loadState: EmailFormatConfigureLoadState;
	dataSourceActions?: readonly EmailFormatRuleDataSourceAction[];
	ruleInfoCard: {
		label: string;
		content: EmailFormatInlineTextContent;
	} | null;
	rulesEditPolicy: EmailFormatRulesEditPolicy | null;
	onKeepMineContent: () => void | Promise<void>;
	onKeepMineRules: () => void | Promise<void>;
	onKeepMineTitle: () => void | Promise<void>;
	onLinkRuleDataSources?: (rule: EmailFormatRule) => void;
	onSaveContent: () => Promise<void>;
	onSaveRules: () => void | Promise<void>;
	onActivationBlockerAction?: () => void | Promise<void>;
	onActivateFormat: () => void | Promise<void>;
	onUseLatestContent: () => void;
	onUseLatestRules: () => void;
	onUseLatestTitle: () => void;
};
