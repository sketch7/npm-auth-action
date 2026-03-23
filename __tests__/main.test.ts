import * as cp from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as process from "process";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { normalizeScope, normalizeRegistry, registryToAuthKey, resolveScopeFromPackageJson } from "../src/main";

describe("normalizeScope", () => {
	test.each([
		{ input: "arcane", expected: "@arcane" },
		{ input: "@arcane", expected: "@arcane" },
		{ input: "MyOrg", expected: "@MyOrg" },
	])("given $input should be $expected", ({ input, expected }) => {
		expect(normalizeScope(input)).toBe(expected);
	});
});

describe("normalizeRegistry", () => {
	test.each([
		{ input: "https://f.feedz.io/sketch7/arcane/npm", expected: "https://f.feedz.io/sketch7/arcane/npm/" },
		{ input: "https://f.feedz.io/sketch7/arcane/npm/", expected: "https://f.feedz.io/sketch7/arcane/npm/" },
		{ input: "http://registry.example.com/npm", expected: "http://registry.example.com/npm/" },
	])("given $input should be $expected", ({ input, expected }) => {
		expect(normalizeRegistry(input)).toBe(expected);
	});
});

describe("registryToAuthKey", () => {
	test.each([
		{ input: "https://f.feedz.io/sketch7/arcane/npm/", expected: "//f.feedz.io/sketch7/arcane/npm/" },
		{ input: "http://registry.example.com/npm/", expected: "//registry.example.com/npm/" },
		{ input: "https://f.feedz.io/sketch7/arcane/npm", expected: "//f.feedz.io/sketch7/arcane/npm/" },
	])("given $input should be $expected", ({ input, expected }) => {
		expect(registryToAuthKey(input)).toBe(expected);
	});
});

describe("resolveScopeFromPackageJson", () => {
	let tmpDir: string;

	beforeEach(() => {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "npm-auth-action-test-"));
	});

	afterEach(() => {
		fs.rmSync(tmpDir, { recursive: true });
	});

	test.each([
		{ name: "@arcane/my-package", expected: "@arcane" },
		{ name: "@my-org/something", expected: "@my-org" },
		{ name: "unscoped-package", expected: null },
	])("given package name $name should resolve scope $expected", async ({ name, expected }) => {
		const pkgJsonPath = path.join(tmpDir, "package.json");
		fs.writeFileSync(pkgJsonPath, JSON.stringify({ name }));
		await expect(resolveScopeFromPackageJson(pkgJsonPath)).resolves.toBe(expected);
	});

	test("returns null when name field is absent", async () => {
		const pkgJsonPath = path.join(tmpDir, "package.json");
		fs.writeFileSync(pkgJsonPath, JSON.stringify({}));
		await expect(resolveScopeFromPackageJson(pkgJsonPath)).resolves.toBeNull();
	});

	test("returns null when file does not exist", async () => {
		await expect(resolveScopeFromPackageJson(path.join(tmpDir, "nonexistent.json"))).resolves.toBeNull();
	});
});

// shows how the runner will run a javascript action with env / stdout protocol
test("npm-auth runs", () => {
	process.env["INPUT_SCOPE"] = "@arcane";
	process.env["INPUT_REGISTRY"] = "https://f.feedz.io/sketch7/arcane/npm/";
	process.env["INPUT_TOKEN"] = "test-token";
	const np = process.execPath;
	const ip = path.join(__dirname, "..", "dist", "index.mjs");
	const options: cp.ExecFileSyncOptions = {
		env: process.env,
	};
	const result = cp.execFileSync(np, [ip], options).toString();
	console.log(result);
	expect(result).not.toBeNull();
});
