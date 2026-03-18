import * as cp from "child_process"
import * as path from "path"
import * as process from "process"
import { describe, expect, test } from "vitest"
import { normalizeScope, normalizeRegistry, registryToAuthKey } from "../src/npm-config-set/main"

describe("normalizeScope", () => {
	const dataset = [
		{
			name: "scope without @ prefix",
			input: "arcane",
			expected: "@arcane"
		},
		{
			name: "scope already has @ prefix",
			input: "@arcane",
			expected: "@arcane"
		},
		{
			name: "scope with uppercase",
			input: "MyOrg",
			expected: "@MyOrg"
		}
	]

	for (const { name, input, expected } of dataset) {
		test(`given ${name} (${JSON.stringify(input)}) should be ${expected}`, () => {
			expect(normalizeScope(input)).toBe(expected)
		})
	}
})

describe("normalizeRegistry", () => {
	const dataset = [
		{
			name: "registry without trailing slash",
			input: "https://f.feedz.io/sketch7/arcane/npm",
			expected: "https://f.feedz.io/sketch7/arcane/npm/"
		},
		{
			name: "registry already has trailing slash",
			input: "https://f.feedz.io/sketch7/arcane/npm/",
			expected: "https://f.feedz.io/sketch7/arcane/npm/"
		},
		{
			name: "http registry without trailing slash",
			input: "http://registry.example.com/npm",
			expected: "http://registry.example.com/npm/"
		}
	]

	for (const { name, input, expected } of dataset) {
		test(`given ${name} (${JSON.stringify(input)}) should be ${expected}`, () => {
			expect(normalizeRegistry(input)).toBe(expected)
		})
	}
})

describe("registryToAuthKey", () => {
	const dataset = [
		{
			name: "https registry",
			input: "https://f.feedz.io/sketch7/arcane/npm/",
			expected: "//f.feedz.io/sketch7/arcane/npm/"
		},
		{
			name: "http registry",
			input: "http://registry.example.com/npm/",
			expected: "//registry.example.com/npm/"
		},
		{
			name: "https registry without trailing slash",
			input: "https://f.feedz.io/sketch7/arcane/npm",
			expected: "//f.feedz.io/sketch7/arcane/npm/"
		}
	]

	for (const { name, input, expected } of dataset) {
		test(`given ${name} (${JSON.stringify(input)}) should be ${expected}`, () => {
			expect(registryToAuthKey(input)).toBe(expected)
		})
	}
})

// shows how the runner will run a javascript action with env / stdout protocol
test("npm-config-set runs", () => {
	process.env["INPUT_SCOPE"] = "@arcane"
	process.env["INPUT_REGISTRY"] = "https://f.feedz.io/sketch7/arcane/npm/"
	process.env["INPUT_TOKEN"] = "test-token"
	const np = process.execPath
	const ip = path.join(__dirname, "..", "dist", "npm-config-set", "index.js")
	const options: cp.ExecFileSyncOptions = {
		env: process.env
	}
	const result = cp.execFileSync(np, [ip], options).toString()
	console.log(result)
	expect(result).not.toBeNull()
})
