import type { IncomingMessage, ServerResponse } from 'node:http';
export type VercelBuilderFetchHandler = (request: Request) => Response | Promise<Response>;
export type VercelBuilderHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;
export declare function createVercelBuilderHandler(fetchHandler: VercelBuilderFetchHandler): VercelBuilderHandler;
//# sourceMappingURL=vercel.d.ts.map