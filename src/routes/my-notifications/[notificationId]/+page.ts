export function load() {
	return {
		headerTitle: 'Notification',
		headerTitleEditable: true,
		headerParent: {
			label: 'My notifications',
			href: '/my-notifications'
		},
		headerParentVisibility: 'desktopOnly'
	};
}
