<script lang="ts">
	import { beforeNavigate } from '$app/navigation';

	type Props = {
		active: boolean;
	};

	let { active }: Props = $props();

	const internalLeaveMessage = 'You have an active builder run. Leave this page?';

	beforeNavigate((navigation) => {
		if (!active) {
			return;
		}

		if (navigation.willUnload) {
			navigation.cancel();
			return;
		}

		if (!window.confirm(internalLeaveMessage)) {
			navigation.cancel();
		}
	});
</script>
