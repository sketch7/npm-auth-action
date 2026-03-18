# npm auth

A GitHub Action that configures an npm scope registry and auth token via
`npm config set`, targeting either the global user config or a project-level
`.npmrc`.

## How It Works

1. Normalizes the scope — adds the `@` prefix if omitted (`arcane` → `@arcane`).
2. Normalizes the registry URL — ensures a trailing slash.
3. Derives the auth key by stripping the `http(s):` scheme from the registry
   URL (e.g. `https://f.feedz.io/sketch7/arcane/npm/` →
   `//f.feedz.io/sketch7/arcane/npm/`).
4. Runs:
   ```
   npm config set @scope:registry <registry>
   npm config set //<registry-host-and-path>:_authToken <token>
   ```
   When `path` is provided both commands receive `--userconfig <path>/.npmrc`
   so only that project's config is affected.

## Inputs

| Input        | Required | Description                                                                                                                                                    |
| ------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scope`      | Yes      | npm scope to configure (e.g. `@arcane` or `arcane`).                                                                                                           |
| `registry`   | Yes      | Registry URL to associate with the scope (e.g. `https://f.feedz.io/sketch7/arcane/npm/`).                                                                      |
| `token`      | Yes      | Auth token for the registry.                                                                                                                                   |
| `config-dir` | No       | Directory path (relative to workspace) that contains the `.npmrc` to update (the `.npmrc` filename is appended automatically). Omit to use global user config. |

## Usage

### Basic — global npm config

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4

  - name: Configure npm auth
    uses: sketch7/npm-auth-action@v1
    with:
      scope: "@arcane"
      registry: "https://f.feedz.io/sketch7/arcane/npm/"
      token: ${{ secrets.NPM_TOKEN }}
```

### Project-level `.npmrc`

```yaml
- name: Configure npm auth (project)
  uses: sketch7/npm-auth-action@v1
  with:
    scope: "@arcane"
    registry: "https://f.feedz.io/sketch7/arcane/npm/"
    token: ${{ secrets.NPM_TOKEN }}
    config-dir: "packages/my-app"
```

## Publishing a New Release

Releases are handled entirely by the
[Release workflow](.github/workflows/release.yml) — no local tooling needed.

1. **Bump the version** — update `version` in `package.json`, commit, and push
   to `main`.
1. **Trigger the workflow** — go to **Actions → Release → Run workflow** and
   click **Run**.

The workflow will automatically:

- Read the version from `package.json` on the triggered branch.
- Create the exact semver tag (e.g. `v1.2.3`) and update the floating major
  tag (e.g. `v1`).
- Create the `v1` branch if it doesn't exist yet, or update it for
  minor/patch releases within the same major.
- Publish a GitHub Release with auto-generated release notes.
