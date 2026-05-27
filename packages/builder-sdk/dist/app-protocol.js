function getGuideAnswerByQuestionId(guideSetup) {
    return new Map(guideSetup.answers.map((answer) => [answer.questionId, answer.answer.trim()]));
}
function getMissingGuideAnswerText(action) {
    return action === 'skippedRemaining' ? 'Skipped' : 'Not specified';
}
function normalizeText(value) {
    return value.trim();
}
function normalizeGuideSetup(guideSetup) {
    return {
        action: guideSetup.action,
        answers: guideSetup.answers
            .map((answer) => ({
            questionId: normalizeText(answer.questionId),
            questionTitle: normalizeText(answer.questionTitle),
            answer: normalizeText(answer.answer)
        }))
            .filter((answer) => answer.questionId.length > 0 &&
            answer.questionTitle.length > 0 &&
            answer.answer.length > 0)
    };
}
function buildGuidedInitialMessage({ title, description, guide, guideSetup }) {
    const answersByQuestionId = getGuideAnswerByQuestionId(guideSetup);
    const answers = guide.questions.map((question) => {
        const answer = answersByQuestionId.get(question.id);
        return `${question.title}\n${answer || getMissingGuideAnswerText(guideSetup.action)}`;
    });
    return [
        `I want to build this email format: ${title}`,
        '',
        'Description:',
        description,
        '',
        'Answers:',
        ...answers.flatMap((answer) => ['', answer])
    ]
        .join('\n')
        .trim();
}
export function createFreeformRunSetup(message) {
    return {
        kind: 'freeform',
        initialMessage: normalizeText(message)
    };
}
export function createGuidedRunSetup({ title, description, guide, action, answers }) {
    const guideSetup = normalizeGuideSetup({
        action,
        answers
    });
    return {
        kind: 'guided',
        initialMessage: buildGuidedInitialMessage({
            title,
            description,
            guide,
            guideSetup
        }),
        guideSetup
    };
}
export function normalizeBuilderRunSetup(setup) {
    if (setup.kind === 'guided') {
        return {
            kind: 'guided',
            initialMessage: normalizeText(setup.initialMessage),
            guideSetup: normalizeGuideSetup(setup.guideSetup)
        };
    }
    return createFreeformRunSetup(setup.initialMessage);
}
export function builderRunSetupsEqual(left, right) {
    return (JSON.stringify(normalizeBuilderRunSetup(left)) ===
        JSON.stringify(normalizeBuilderRunSetup(right)));
}
export function buildBuilderRunSetupPromptText(setup) {
    const normalizedSetup = normalizeBuilderRunSetup(setup);
    if (normalizedSetup.kind === 'freeform') {
        return normalizedSetup.initialMessage;
    }
    const completionText = normalizedSetup.guideSetup.action === 'skippedRemaining'
        ? 'The user skipped the remaining guided setup questions.'
        : 'The user submitted the guided setup.';
    return [
        'Structured guided setup:',
        `Action: ${normalizedSetup.guideSetup.action}`,
        completionText,
        'Answers JSON:',
        JSON.stringify(normalizedSetup.guideSetup.answers, null, 2)
    ].join('\n').trim();
}
//# sourceMappingURL=app-protocol.js.map