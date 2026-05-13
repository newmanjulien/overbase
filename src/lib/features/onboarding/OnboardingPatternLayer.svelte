<script lang="ts">
</script>

<div
	class="pointer-events-none absolute inset-y-0 right-0 left-[calc(8px+((100%-16px)*0.502)+6px)] hidden overflow-hidden lg:block"
	aria-hidden="true"
>
	<svg class="block size-full" width="100%" height="100%" preserveAspectRatio="none">
		<defs>
			<pattern id="onboarding-light-grid" width="8" height="8" patternUnits="userSpaceOnUse">
				<rect width="2" height="2" rx="0.32" fill="#bfbfbf" opacity="0.14" />
			</pattern>
			<pattern id="onboarding-mid-grid" width="8" height="8" patternUnits="userSpaceOnUse">
				<rect width="2" height="2" rx="0.32" fill="#b2b2b2" opacity="0.48" />
			</pattern>
			<pattern id="onboarding-dark-grid" width="8" height="8" patternUnits="userSpaceOnUse">
				<rect width="2" height="2" rx="0.32" fill="#a5a5a5" opacity="0.68" />
			</pattern>
			<radialGradient id="onboarding-patch-a" cx="0.18" cy="0.12" r="0.38">
				<stop offset="0" stop-color="white" stop-opacity="1" />
				<stop offset="0.52" stop-color="white" stop-opacity="0.48" />
				<stop offset="1" stop-color="white" stop-opacity="0" />
			</radialGradient>
			<radialGradient id="onboarding-patch-b" cx="0.66" cy="0.23" r="0.34">
				<stop offset="0" stop-color="white" stop-opacity="0.92" />
				<stop offset="0.54" stop-color="white" stop-opacity="0.42" />
				<stop offset="1" stop-color="white" stop-opacity="0" />
			</radialGradient>
			<radialGradient id="onboarding-patch-c" cx="0.28" cy="0.78" r="0.38">
				<stop offset="0" stop-color="white" stop-opacity="0.9" />
				<stop offset="0.54" stop-color="white" stop-opacity="0.4" />
				<stop offset="1" stop-color="white" stop-opacity="0" />
			</radialGradient>
			<radialGradient id="onboarding-patch-d" cx="0.9" cy="0.82" r="0.4">
				<stop offset="0" stop-color="white" stop-opacity="0.96" />
				<stop offset="0.52" stop-color="white" stop-opacity="0.44" />
				<stop offset="1" stop-color="white" stop-opacity="0" />
			</radialGradient>
			<mask id="onboarding-mask-a" maskContentUnits="objectBoundingBox">
				<rect width="1" height="1" fill="url(#onboarding-patch-a)" />
			</mask>
			<mask id="onboarding-mask-b" maskContentUnits="objectBoundingBox">
				<rect width="1" height="1" fill="url(#onboarding-patch-b)" />
			</mask>
			<mask id="onboarding-mask-c" maskContentUnits="objectBoundingBox">
				<rect width="1" height="1" fill="url(#onboarding-patch-c)" />
			</mask>
			<mask id="onboarding-mask-d" maskContentUnits="objectBoundingBox">
				<rect width="1" height="1" fill="url(#onboarding-patch-d)" />
			</mask>
		</defs>
		<rect width="100%" height="100%" fill="url(#onboarding-light-grid)" />
		<rect width="100%" height="100%" fill="url(#onboarding-mid-grid)" mask="url(#onboarding-mask-a)" />
		<rect width="100%" height="100%" fill="url(#onboarding-dark-grid)" mask="url(#onboarding-mask-b)" />
		<rect width="100%" height="100%" fill="url(#onboarding-mid-grid)" mask="url(#onboarding-mask-c)" />
		<rect width="100%" height="100%" fill="url(#onboarding-dark-grid)" mask="url(#onboarding-mask-d)" />
	</svg>
</div>
