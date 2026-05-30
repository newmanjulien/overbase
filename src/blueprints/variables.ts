export type BlueprintVariableDefinition = {
	id: string;
	label: string;
	description?: string;
	sampleValue?: string;
};

export function resolveBlueprintVariable(
	variables: readonly BlueprintVariableDefinition[],
	variableId: string
) {
	return variables.find((variable) => variable.id === variableId) ?? null;
}

export function formatBlueprintVariableLabel(
	variables: readonly BlueprintVariableDefinition[],
	variableId: string
) {
	return resolveBlueprintVariable(variables, variableId)?.label ?? `{${variableId}}`;
}
