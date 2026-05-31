export type InlineTextPart =
	| {
			kind: 'text';
			text: string;
	  }
	| {
			kind: 'link';
			label: string;
			href: `/${string}`;
	  }
	| {
			kind: 'tooltip';
			label: string;
			tooltipText: string;
	  };

export type InlineTextContent = string | readonly InlineTextPart[];

export function hasInlineTextContent(content: InlineTextContent) {
	if (typeof content === 'string') {
		return Boolean(content.trim());
	}

	return content.some((part) => {
		if (part.kind === 'text') {
			return Boolean(part.text.trim());
		}

		return Boolean(part.label.trim());
	});
}
