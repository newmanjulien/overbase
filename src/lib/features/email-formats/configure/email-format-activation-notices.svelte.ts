export const ACTIVATION_SUCCESS_NOTICE_MS = 4000;

export function getActivationSuccessMessage(count = 1) {
	return count === 1
		? 'Recipients will start receiving this format.'
		: 'Recipients will start receiving these formats.';
}

export function createTimedNotice(defaultDurationMs = ACTIVATION_SUCCESS_NOTICE_MS) {
	let message = $state<string | null>(null);
	let timeout: ReturnType<typeof setTimeout> | null = null;

	function clear() {
		message = null;

		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
	}

	function show(nextMessage: string, durationMs = defaultDurationMs) {
		clear();
		message = nextMessage;
		timeout = setTimeout(() => {
			message = null;
			timeout = null;
		}, durationMs);
	}

	return {
		get message() {
			return message;
		},
		clear,
		show,
		destroy: clear
	};
}
