export type BuilderSessionStartRequest = {
	startRequestId: string;
};

export function createBuilderSessionStartRequest(
	request?: Partial<BuilderSessionStartRequest> | null
): BuilderSessionStartRequest {
	return {
		startRequestId: request?.startRequestId?.trim() || crypto.randomUUID()
	};
}
