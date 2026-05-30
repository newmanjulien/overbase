import type { BlueprintVariableDefinition } from '../../../../blueprints/model';

export const BLUEPRINT_VARIABLE_DRAG_MIME = 'application/x-overbase-blueprint-variable';

export type BlueprintVariableDragPayload = {
	fieldId: string;
	label: string;
};

export function encodeBlueprintVariableDragPayload(field: BlueprintVariableDefinition) {
	return JSON.stringify({
		fieldId: field.id,
		label: field.label
	} satisfies BlueprintVariableDragPayload);
}

export function createBlueprintVariableDragImage(label: string) {
	const dragImage = document.createElement('span');

	dragImage.textContent = label;
	dragImage.style.position = 'fixed';
	dragImage.style.top = '-1000px';
	dragImage.style.left = '0';
	dragImage.style.zIndex = '-1';
	dragImage.style.display = 'inline-flex';
	dragImage.style.alignItems = 'center';
	dragImage.style.border = '1px solid transparent';
	dragImage.style.borderRadius = '9999px';
	dragImage.style.background = 'rgb(236 253 245 / 0.8)';
	dragImage.style.padding = '0.125rem 0.375rem';
	dragImage.style.color = 'rgb(6 78 59)';
	dragImage.style.font =
		'400 0.73rem/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
	dragImage.style.whiteSpace = 'nowrap';
	dragImage.style.pointerEvents = 'none';
	dragImage.style.boxSizing = 'border-box';

	document.body.appendChild(dragImage);

	return dragImage;
}

export function decodeBlueprintVariableDragPayload(value: string): BlueprintVariableDragPayload | null {
	try {
		const payload = JSON.parse(value) as Partial<BlueprintVariableDragPayload>;

		if (typeof payload.fieldId !== 'string' || typeof payload.label !== 'string') {
			return null;
		}

		const fieldId = payload.fieldId.trim();
		const label = payload.label.trim();

		if (!fieldId || !label) {
			return null;
		}

		return { fieldId, label };
	} catch {
		return null;
	}
}
