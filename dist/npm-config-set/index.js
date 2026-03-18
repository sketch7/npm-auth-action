const require_core = require('../core-D4ItVqPB.js');
let path = require("path");

//#region src/npm-config-set/main.ts
function normalizeScope(scope) {
	return scope.startsWith("@") ? scope : `@${scope}`;
}
function normalizeRegistry(registry) {
	return registry.endsWith("/") ? registry : `${registry}/`;
}
function registryToAuthKey(registry) {
	return normalizeRegistry(registry).replace(/^https?:/, "");
}
async function run() {
	const scope = require_core.getInput("scope", { required: true });
	const registry = require_core.getInput("registry", { required: true });
	const token = require_core.getInput("token", { required: true });
	const configPath = require_core.getInput("path");
	require_core.setSecret(token);
	const normalizedScope = normalizeScope(scope);
	const normalizedRegistry = normalizeRegistry(registry);
	const authKey = registryToAuthKey(registry);
	const userConfigArgs = configPath ? ["--userconfig", (0, path.resolve)(process.cwd(), configPath, ".npmrc")] : [];
	require_core.info(`Setting registry for ${normalizedScope} to ${normalizedRegistry}`);
	await require_core.exec("npm", [
		"config",
		"set",
		`${normalizedScope}:registry`,
		normalizedRegistry,
		...userConfigArgs
	]);
	await require_core.exec("npm", [
		"config",
		"set",
		`${authKey}:_authToken`,
		token,
		...userConfigArgs
	]);
}

//#endregion
//#region src/npm-config-set/index.ts
run().catch((error) => {
	if (error instanceof Error) require_core.setFailed(error.message);
});

//#endregion