import * as cp from "child_process"
import * as path from "path"
import * as process from "process"
import { describe, expect, test } from "vitest"
import { normalizeScope, normalizeRegistry, registryToAuthKey } from "../src/main"

describe("normalizeScope", () => {
	test.each([
		{ input: "arcane", expected: "@arcane" },
		{ input: "@arcane", expected: "@arcane" },
		{ input: "MyOrg", expected: "@MyOrg" },
	])("given $input should be $expected", ({ input, expected }) => {
		expect(normalizeScope(input)).toBe(expected)
	})
})

describe("normalizeRegistry", () => {
	test.each([
		{ input: "https://f.feedz.io/sketch7/arcane/npm", expected: "https://f.feedz.io/sketch7/arcane/npm/" },
		{ input: "https://f.feedz.io/sketch7/arcane/npm/", expected: "https://f.feedz.io/sketch7/arcane/npm/" },
		{ input: "http://registry.example.com/npm", expected: "http://registry.example.com/npm/" },
	])("given $input should be $expected", ({ input, expected }) => {
		expect(normalizeRegistry(input)).toBe(expected)
	})
})

describe("registryToAuthKey", () => {
	test.each([
		{ input: "https://f.feedz.io/sketch7/arcane/npm/", expected: "//f.feedz.io/sketch7/arcane/npm/" },
		{ input: "http://registry.example.com/npm/", expected: "//registry.example.com/npm/" },
		{ input: "https://f.feedz.io/sketch7/arcane/npm", expected: "//f.feedz.io/sketch7/arcane/npm/" },
	])("given $input should be $expected", ({ input, expected }) => {
		expect(registryToAuthKey(input)).toBe(expected)
	})
})

// shows how the runner will run a javascript action with env / stdout protocol
test("npm-auth runs", () => {
	process.env["INPUT_SCOPE"] = "@arcane"
	process.env["INPUT_REGISTRY"] = "https://f.feedz.io/sketch7/arcane/npm/"
	process.env["INPUT_TOKEN"] = "test-token"
	const np = process.execPath
	const ip = path.join(__dirname, "..", "dist", "index.js")
	const options: cp.ExecFileSyncOptions = {
		env: process.env
	}
	const result = cp.execFileSync(np, [ip], options).toString()
	console.log(result)
	expect(result).not.toBeNull()
})
