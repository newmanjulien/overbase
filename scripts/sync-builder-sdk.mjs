#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const overbaseRoot = path.resolve(path.dirname(scriptPath), '..');
const canonicalSdkRoot = path.join(overbaseRoot, 'packages', 'builder-sdk');
const builderRuntimeRoots = [
	{
		name: 'Bring the Firm',
		root: path.resolve(overbaseRoot, '..', 'bring-the-firm-builder', 'runtime')
	},
	{
		name: 'Custom Opportunity Format',
		root: path.resolve(overbaseRoot, '..', 'custom-opportunity-format', 'runtime')
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

const rootFiles = ['README.md', 'package.json', 'tsconfig.json', 'tsconfig.build.json'];
const sourceFiles = await listTopLevelSourceFiles(canonicalSdkRoot);
const canonicalSourceFileSet = new Set(sourceFiles);
const files = [...rootFiles, ...sourceFiles];

async function listTopLevelSourceFiles(sdkRoot) {
	return (await readdir(path.join(sdkRoot, 'src')))
		.filter((file) => file.endsWith('.ts'))
		.map((file) => path.join('src', file))
		.sort();
}

async function syncFile(sdk, relativePath) {
	const source = path.join(canonicalSdkRoot, relativePath);
	const target = path.join(sdk.sdkRoot, relativePath);

	await mkdir(path.dirname(target), { recursive: true });
	await copyFile(source, target);
}

async function removeStaleSourceFiles(sdk) {
	const sourceFiles = await listTopLevelSourceFiles(sdk.sdkRoot);
	const staleFiles = sourceFiles.filter((file) => !canonicalSourceFileSet.has(file));

	await Promise.all(staleFiles.map((file) => unlink(path.join(sdk.sdkRoot, file))));

	return staleFiles;
}

async function fileMatches(sdk, relativePath) {
	const source = path.join(canonicalSdkRoot, relativePath);
	const target = path.join(sdk.sdkRoot, relativePath);
	const [sourceContent, targetContent] = await Promise.all([readFile(source), readFile(target)]);

	return sourceContent.equals(targetContent);
}

if (shouldSync) {
	await Promise.all(vendoredSdks.flatMap((sdk) => files.map((file) => syncFile(sdk, file))));
	const staleFiles = (await Promise.all(vendoredSdks.map(removeStaleSourceFiles))).flat();
	console.log(`Synced ${files.length} SDK source/package files into ${vendoredSdks.length} builder runtimes.`);
	if (staleFiles.length > 0) {
		console.log(`Removed ${staleFiles.length} stale vendored SDK source file${staleFiles.length === 1 ? '' : 's'}.`);
	}
}

if (shouldCheck) {
	const mismatches = [];
	const extraSourceFiles = [];

	for (const sdk of vendoredSdks) {
		for (const file of files) {
			if (!(await fileMatches(sdk, file))) {
				mismatches.push(`${sdk.name}: ${file}`);
			}
		}

		for (const file of await listTopLevelSourceFiles(sdk.sdkRoot)) {
			if (!canonicalSourceFileSet.has(file)) {
				extraSourceFiles.push(`${sdk.name}: ${file}`);
			}
		}
	}

	if (mismatches.length > 0 || extraSourceFiles.length > 0) {
		console.error('Builder SDK copies are out of sync with Overbase:');
		for (const file of mismatches) {
			console.error(`- ${file}`);
		}
		for (const file of extraSourceFiles) {
			console.error(`- ${file} (extra vendored source file)`);
		}
		console.error('Run `npm run builder-sdk:sync-bring` from Overbase to update the vendored copy.');
		process.exit(1);
	}

	console.log('Builder SDK source/package files match Overbase in all builder runtimes.');
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
