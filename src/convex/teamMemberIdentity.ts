export const TEAM_MEMBER_EMAIL_SEPARATOR_REGEX = /[,\s]+/;
export const TEAM_MEMBER_EMAIL_REGEX = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;

export function normalizeTeamMemberEmail(email: string) {
	return email.trim().toLowerCase();
}

export function normalizeTeamMemberName(name: string) {
	return name.trim();
}

export function getTeamMemberDisplayName(teamMember: { email: string; name: string }) {
	return teamMember.name || teamMember.email;
}
