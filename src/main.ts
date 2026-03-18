import * as core from "@actions/core"
import * as exec from "@actions/exec"
import { readFile } from "fs/promises"
import { resolve } from "path"

export async function run(): Promise<void> {
	let scope = core.getInput("scope")
	const registry = core.getInput("registry", { required: true })
	const token = core.getInput("token", { required: true })
	const configPath = core.getInput("config-dir")
	const packageJsonDir = core.getInput("package-json-dir")

	core.setSecret(token)

	if (!scope) {
		const packageJsonPath = resolve(process.cwd(), packageJsonDir || ".", "package.json")
		core.info(`Scope not provided, resolving from ${packageJsonPath}`)
		scope = (await resolveScopeFromPackageJson(packageJsonPath)) ?? ""
		if (!scope) {
			throw new Error(
				`Scope was not provided and could not be resolved from '${packageJsonPath}'. Ensure the package.json has a scoped name (e.g. "@scope/package-name") or provide the 'scope' input.`,
			)
		}
		core.info(`Resolved scope '${scope}' from package.json`)
	}

	const normalizedScope = normalizeScope(scope)
	const normalizedRegistry = normalizeRegistry(registry)
	const authKey = registryToAuthKey(registry)

	const userConfigArgs = configPath ? ["--userconfig", resolve(process.cwd(), configPath, ".npmrc")] : []

	core.info(`Setting registry for ${normalizedScope} to ${normalizedRegistry}`)

	await exec.exec("npm", ["config", "set", `${normalizedScope}:registry`, normalizedRegistry, ...userConfigArgs])
	await exec.exec("npm", ["config", "set", `${authKey}:_authToken`, token, ...userConfigArgs])
}

export function normalizeScope(scope: string): string {
	return scope.startsWith("@") ? scope : `@${scope}`
}

export function normalizeRegistry(registry: string): string {
	return registry.endsWith("/") ? registry : `${registry}/`
}

export function registryToAuthKey(registry: string): string {
	return normalizeRegistry(registry).replace(/^https?:/, "")
}

export async function resolveScopeFromPackageJson(packageJsonPath: string): Promise<string | null> {
	try {
		const content = await readFile(packageJsonPath, "utf-8")
		const pkg = JSON.parse(content) as { name?: string }
		if (!pkg.name?.startsWith("@")) return null
		return pkg.name.split("/")[0] ?? null
	} catch {
		return null
	}
}
