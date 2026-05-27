#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const overbaseRoot = path.resolve(path.dirname(scriptPath), '..');
const canonicalSdkRoot = path.join(overbaseRoot, 'packages', 'builder-sdk');
const builderRuntimeRoots = [
	{
		name: 'Bring the Firm Builder',
		root: path.resolve(overbaseRoot, '..', 'bring-the-firm-builder', 'runtime')
	},
	{
		name: 'Custom Builder',
		root: path.resolve(overbaseRoot, '..', 'custom-builder', 'runtime')
	}
];
const vendoredSdks = builderRuntimeRoots.map((runtime) => ({
	...runtime,
	sdkRoot: path.join(runtime.root, 'packages', 'builder-sdk')
}));

const args = new Set(process.argv.slice(2));
const shouldSync = args.has('--sync');
const shouldCheck = args.has('--check') || !shouldSync;
const shouldBuild = args.has('--build');

for (const sdk of vendoredSdks) {
	if (!existsSync(sdk.sdkRoot)) {
		console.error(`${sdk.name} SDK was not found at ${sdk.sdkRoot}`);
		process.exit(1);
	}
}

async function listPackageFiles(sdkRoot, relativeDir = '') {
	const entries = await readdir(path.join(sdkRoot, relativeDir), { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const relativePath = path.join(relativeDir, entry.name);

			if (entry.isDirectory()) {
				return await listPackageFiles(sdkRoot, relativePath);
			}

			return entry.isFile() ? [relativePath] : [];
		})
	);

	return files.flat().sort();
}

async function syncFile(sdk, relativePath) {
	const source = path.join(canonicalSdkRoot, relativePath);
	const target = path.join(sdk.sdkRoot, relativePath);

	await mkdir(path.dirname(target), { recursive: true });
	await copyFile(source, target);
}

async function removeStalePackageFiles(sdk, canonicalFileSet) {
	const packageFiles = await listPackageFiles(sdk.sdkRoot);
	const staleFiles = packageFiles.filter((file) => !canonicalFileSet.has(file));

	await Promise.all(staleFiles.map((file) => rm(path.join(sdk.sdkRoot, file), { force: true })));

	return staleFiles;
}

async function fileMatches(sdk, relativePath) {
	const source = path.join(canonicalSdkRoot, relativePath);
	const target = path.join(sdk.sdkRoot, relativePath);
	const [sourceContent, targetContent] = await Promise.all([readFile(source), readFile(target)]);

	return sourceContent.equals(targetContent);
}

if (shouldSync) {
	const packageFiles = await listPackageFiles(canonicalSdkRoot);
	const canonicalFileSet = new Set(packageFiles);

	await Promise.all(vendoredSdks.flatMap((sdk) => packageFiles.map((file) => syncFile(sdk, file))));
	const staleFiles = (
		await Promise.all(vendoredSdks.map((sdk) => removeStalePackageFiles(sdk, canonicalFileSet)))
	).flat();
	console.log(`Synced ${packageFiles.length} SDK package files into ${vendoredSdks.length} builder runtimes.`);
	if (staleFiles.length > 0) {
		console.log(`Removed ${staleFiles.length} stale vendored SDK package file${staleFiles.length === 1 ? '' : 's'}.`);
	}
}

if (shouldBuild) {
	execFileSync('npm', ['run', 'builder-sdk:build'], {
		cwd: overbaseRoot,
		stdio: 'inherit'
	});
	for (const runtime of builderRuntimeRoots) {
		execFileSync('npm', ['run', 'builder-sdk:build'], {
			cwd: runtime.root,
			stdio: 'inherit'
		});
	}
}

if (shouldCheck) {
	const canonicalPackageFiles = await listPackageFiles(canonicalSdkRoot);
	const canonicalPackageFileSet = new Set(canonicalPackageFiles);
	const mismatches = [];
	const missingFiles = [];
	const extraFiles = [];

	for (const sdk of vendoredSdks) {
		const vendoredPackageFiles = await listPackageFiles(sdk.sdkRoot);
		const vendoredPackageFileSet = new Set(vendoredPackageFiles);

		for (const file of canonicalPackageFiles) {
			if (!vendoredPackageFileSet.has(file)) {
				missingFiles.push(`${sdk.name}: ${file}`);
			} else if (!(await fileMatches(sdk, file))) {
				mismatches.push(`${sdk.name}: ${file}`);
			}
		}

		for (const file of vendoredPackageFiles) {
			if (!canonicalPackageFileSet.has(file)) {
				extraFiles.push(`${sdk.name}: ${file}`);
			}
		}
	}

	if (mismatches.length > 0 || missingFiles.length > 0 || extraFiles.length > 0) {
		console.error('Builder SDK copies are out of sync with Overbase:');
		for (const file of mismatches) {
			console.error(`- ${file}`);
		}
		for (const file of missingFiles) {
			console.error(`- ${file} (missing vendored package file)`);
		}
		for (const file of extraFiles) {
			console.error(`- ${file} (extra vendored package file)`);
		}
		console.error('Run `npm run builder-sdk:sync-bring` from Overbase to update the vendored copies.');
		process.exit(1);
	}

	console.log('Builder SDK package files match Overbase in all builder runtimes.');
}
