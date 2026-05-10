#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const overbaseRoot = path.resolve(path.dirname(scriptPath), '..');
const bringTheFirmRoot = path.resolve(overbaseRoot, '..', 'bring-the-firm');
const canonicalSdkRoot = path.join(overbaseRoot, 'packages', 'builder-sdk');
const vendoredSdkRoot = path.join(bringTheFirmRoot, 'packages', 'builder-sdk');

const args = new Set(process.argv.slice(2));
const shouldSync = args.has('--sync');
const shouldCheck = args.has('--check') || !shouldSync;
const shouldBuild = args.has('--build');

if (!existsSync(vendoredSdkRoot)) {
	console.error(`Bring the Firm SDK was not found at ${vendoredSdkRoot}`);
	process.exit(1);
}

const rootFiles = ['README.md', 'package.json', 'tsconfig.json', 'tsconfig.build.json'];
const sourceFiles = (await readdir(path.join(canonicalSdkRoot, 'src')))
	.filter((file) => file.endsWith('.ts'))
	.map((file) => path.join('src', file));
const files = [...rootFiles, ...sourceFiles];

async function syncFile(relativePath) {
	const source = path.join(canonicalSdkRoot, relativePath);
	const target = path.join(vendoredSdkRoot, relativePath);

	await mkdir(path.dirname(target), { recursive: true });
	await copyFile(source, target);
}

async function fileMatches(relativePath) {
	const source = path.join(canonicalSdkRoot, relativePath);
	const target = path.join(vendoredSdkRoot, relativePath);
	const [sourceContent, targetContent] = await Promise.all([readFile(source), readFile(target)]);

	return sourceContent.equals(targetContent);
}

if (shouldSync) {
	await Promise.all(files.map(syncFile));
	console.log(`Synced ${files.length} SDK source/package files into Bring the Firm.`);
}

if (shouldCheck) {
	const mismatches = [];

	for (const file of files) {
		if (!(await fileMatches(file))) {
			mismatches.push(file);
		}
	}

	if (mismatches.length > 0) {
		console.error('Bring the Firm builder SDK is out of sync with Overbase:');
		for (const file of mismatches) {
			console.error(`- ${file}`);
		}
		console.error('Run `npm run builder-sdk:sync-bring` from Overbase to update the vendored copy.');
		process.exit(1);
	}

	console.log('Bring the Firm builder SDK source/package files match Overbase.');
}

if (shouldBuild) {
	execFileSync('npm', ['run', 'builder-sdk:build'], {
		cwd: overbaseRoot,
		stdio: 'inherit'
	});
	execFileSync('npm', ['run', 'builder-sdk:build'], {
		cwd: bringTheFirmRoot,
		stdio: 'inherit'
	});
}
