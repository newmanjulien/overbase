export type BuilderSessionStartRequest = {
	startRequestId: string;
	resumeToken: string;
};

function createResumeToken() {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);

	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createBuilderSessionStartRequest(
	request?: Partial<BuilderSessionStartRequest> | null
): BuilderSessionStartRequest {
	return {
		startRequestId: request?.startRequestId?.trim() || crypto.randomUUID(),
		resumeToken: request?.resumeToken?.trim() || createResumeToken()
	};
}
