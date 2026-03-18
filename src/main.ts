import * as core from "@actions/core"
import * as exec from "@actions/exec"
import { resolve } from "path"

export function normalizeScope(scope: string): string {
	return scope.startsWith("@") ? scope : `@${scope}`
}

export function normalizeRegistry(registry: string): string {
	return registry.endsWith("/") ? registry : `${registry}/`
}

export function registryToAuthKey(registry: string): string {
	return normalizeRegistry(registry).replace(/^https?:/, "")
}

export async function run(): Promise<void> {
	const scope = core.getInput("scope", { required: true })
	const registry = core.getInput("registry", { required: true })
	const token = core.getInput("token", { required: true })
	const configPath = core.getInput("config-dir")

	core.setSecret(token)

	const normalizedScope = normalizeScope(scope)
	const normalizedRegistry = normalizeRegistry(registry)
	const authKey = registryToAuthKey(registry)

	const userConfigArgs = configPath ? ["--userconfig", resolve(process.cwd(), configPath, ".npmrc")] : []

	core.info(`Setting registry for ${normalizedScope} to ${normalizedRegistry}`)

	await exec.exec("npm", ["config", "set", `${normalizedScope}:registry`, normalizedRegistry, ...userConfigArgs])
	await exec.exec("npm", ["config", "set", `${authKey}:_authToken`, token, ...userConfigArgs])
}
