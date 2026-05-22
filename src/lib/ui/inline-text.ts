export type InlineTextPart =
	| {
			kind: 'text';
			text: string;
	  }
	| {
			kind: 'tooltip';
			label: string;
			tooltipText: string;
	  };

export type InlineTextContent = string | readonly InlineTextPart[];
