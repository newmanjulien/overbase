export declare const EMAIL_DRAFT_LIMITS: {
    readonly recipient: 140;
    readonly recipients: 12;
    readonly attachment: 160;
    readonly attachments: 12;
    readonly bodyBlocks: 12;
    readonly bodyText: 1000;
    readonly bulletItems: 8;
    readonly linkLabel: 120;
    readonly linkHref: 500;
};
export type EmailParagraphBlock = {
    type: 'paragraph';
    text: string;
};
export type EmailBulletsBlock = {
    type: 'bullets';
    items: string[];
};
export type EmailLinkBlock = {
    type: 'link';
    label: string;
    href: string;
};
export type EmailBodyBlock = EmailParagraphBlock | EmailBulletsBlock | EmailLinkBlock;
export type EmailDraft = {
    to: string[];
    cc: string[];
    attachments: string[];
    body: EmailBodyBlock[];
};
export type EmailDraftPatch = {
    to?: string[];
    cc?: string[];
    attachments?: string[];
    body?: EmailBodyBlock[];
};
export type EmailDraftState = {
    version: number;
    visibility: 'hidden' | 'visible';
    draft: EmailDraft;
};
export declare function createDefaultEmailDraft(): EmailDraft;
export declare function normalizePdfAttachmentName(value: string): string;
export declare function normalizeEmailBodyBlock(block: EmailBodyBlock): EmailBodyBlock | null;
export declare function normalizeEmailDraft(draft: EmailDraft): EmailDraft;
export declare function hasEmailDraftChanged(before: EmailDraft, after: EmailDraft): boolean;
export declare function applyEmailDraftPatch(draft: EmailDraft, patch: EmailDraftPatch): EmailDraft;
export declare function hasEmailDraftPatchFields(patch: EmailDraftPatch | null): patch is EmailDraftPatch;
export declare const emailBodyBlockJsonSchema: {
    readonly anyOf: readonly [{
        readonly type: "object";
        readonly additionalProperties: false;
        readonly properties: {
            readonly type: {
                readonly type: "string";
                readonly enum: readonly ["paragraph"];
            };
            readonly text: {
                readonly type: "string";
                readonly description: "A concise email paragraph. Prefer one or two sentences.";
            };
        };
        readonly required: readonly ["type", "text"];
    }, {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly properties: {
            readonly type: {
                readonly type: "string";
                readonly enum: readonly ["bullets"];
            };
            readonly items: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                    readonly description: "A concise email bullet.";
                };
                readonly maxItems: 8;
            };
        };
        readonly required: readonly ["type", "items"];
    }, {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly properties: {
            readonly type: {
                readonly type: "string";
                readonly enum: readonly ["link"];
            };
            readonly label: {
                readonly type: "string";
            };
            readonly href: {
                readonly type: "string";
            };
        };
        readonly required: readonly ["type", "label", "href"];
    }];
};
export declare const emailDraftJsonSchema: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly properties: {
        readonly to: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly maxItems: 12;
        };
        readonly cc: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly maxItems: 12;
        };
        readonly attachments: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly maxItems: 12;
        };
        readonly body: {
            readonly type: "array";
            readonly items: {
                readonly anyOf: readonly [{
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly type: {
                            readonly type: "string";
                            readonly enum: readonly ["paragraph"];
                        };
                        readonly text: {
                            readonly type: "string";
                            readonly description: "A concise email paragraph. Prefer one or two sentences.";
                        };
                    };
                    readonly required: readonly ["type", "text"];
                }, {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly type: {
                            readonly type: "string";
                            readonly enum: readonly ["bullets"];
                        };
                        readonly items: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                                readonly description: "A concise email bullet.";
                            };
                            readonly maxItems: 8;
                        };
                    };
                    readonly required: readonly ["type", "items"];
                }, {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly type: {
                            readonly type: "string";
                            readonly enum: readonly ["link"];
                        };
                        readonly label: {
                            readonly type: "string";
                        };
                        readonly href: {
                            readonly type: "string";
                        };
                    };
                    readonly required: readonly ["type", "label", "href"];
                }];
            };
            readonly maxItems: 12;
        };
    };
    readonly required: readonly ["to", "cc", "attachments", "body"];
};
export declare const emailDraftPatchJsonSchema: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly properties: {
        readonly to: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly maxItems: 12;
        };
        readonly cc: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly maxItems: 12;
        };
        readonly attachments: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly maxItems: 12;
        };
        readonly body: {
            readonly type: "array";
            readonly items: {
                readonly anyOf: readonly [{
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly type: {
                            readonly type: "string";
                            readonly enum: readonly ["paragraph"];
                        };
                        readonly text: {
                            readonly type: "string";
                            readonly description: "A concise email paragraph. Prefer one or two sentences.";
                        };
                    };
                    readonly required: readonly ["type", "text"];
                }, {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly type: {
                            readonly type: "string";
                            readonly enum: readonly ["bullets"];
                        };
                        readonly items: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                                readonly description: "A concise email bullet.";
                            };
                            readonly maxItems: 8;
                        };
                    };
                    readonly required: readonly ["type", "items"];
                }, {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly type: {
                            readonly type: "string";
                            readonly enum: readonly ["link"];
                        };
                        readonly label: {
                            readonly type: "string";
                        };
                        readonly href: {
                            readonly type: "string";
                        };
                    };
                    readonly required: readonly ["type", "label", "href"];
                }];
            };
            readonly maxItems: 12;
        };
    };
};
//# sourceMappingURL=email.d.ts.map