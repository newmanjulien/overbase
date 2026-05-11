import {
	CURRENT_USER_ID,
	CURRENT_USER_PROFILE
} from '../lib/app/current-user';

const CURRENT_USER = {
	id: CURRENT_USER_ID,
	...CURRENT_USER_PROFILE
} as const;

const TEAM_ROSTER = [
	{
		personId: 'maya',
		name: 'Maya Patel',
		avatar: ''
	},
	{
		personId: 'rafi',
		name: 'Rafi Cohen',
		avatar: ''
	},
	{
		personId: 'elena',
		name: 'Elena Torres',
		avatar: ''
	}
] as const;

export function getPeopleRoster() {
	return [
		CURRENT_USER,
		...TEAM_ROSTER.map((person) => ({
			id: person.personId,
			name: person.name,
			avatar: person.avatar
		}))
	];
}

export function normalizeTeamMemberIds(teamMemberIds: string[]) {
	const teammateIdSet = new Set<string>(TEAM_ROSTER.map((person) => person.personId));
	const normalizedIds = teamMemberIds.map((id) => id.trim()).filter(Boolean);
	const teammateIds = Array.from(new Set(normalizedIds)).filter((teamMemberId) =>
		teammateIdSet.has(teamMemberId)
	);

	return [CURRENT_USER_ID, ...teammateIds];
}
