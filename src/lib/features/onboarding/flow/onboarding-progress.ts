import type { Doc } from '$convex/_generated/dataModel';

export type WorkspaceOnboardingStep = 'company' | 'partner' | 'complete';

type OnboardingWorkspace = Pick<
	Doc<'workspaces'>,
	'name' | 'website' | 'onboardingCompletedAt'
> | null | undefined;

export function getOnboardingStepForWorkspace(
	workspace: OnboardingWorkspace
): WorkspaceOnboardingStep {
	if (workspace?.onboardingCompletedAt) {
		return 'complete';
	}

	if (!workspace?.name || !workspace.website) {
		return 'company';
	}

	return 'partner';
}
