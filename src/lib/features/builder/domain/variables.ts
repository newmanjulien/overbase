export type BuilderVariableDefinition = {
	id: string;
	label: string;
	description?: string;
	sampleValue?: string;
};

export function resolveBuilderVariable(
	variables: readonly BuilderVariableDefinition[],
	variableId: string
) {
	return variables.find((variable) => variable.id === variableId) ?? null;
}

export function formatBuilderVariableLabel(
	variables: readonly BuilderVariableDefinition[],
	variableId: string
) {
	return resolveBuilderVariable(variables, variableId)?.label ?? `{${variableId}}`;
}
