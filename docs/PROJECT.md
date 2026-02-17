# PROJECT

## Commands
- Setup: `make setup`
- Dev: `make dev`
- Test: `make test`
- Browser smoke test: `make test-e2e` (or `npm run test:e2e`)
- Bundle budget check: `make size-check` (or `npm run size:check`, requires `dist/` from build)
- Lint: `make lint`
- Typecheck: `make typecheck`
- Build: `make build`
- Quality gate: `make check`
- Release build: `make release`

## Notes
- Node.js baseline: `>=20.19`.
- Static build output is in `dist/`.
- Docker builds run `npm ci` and `npm run build`.

## GitHub Actions (Self-Hosted Runner)
- All workflows in `.github/workflows/` are configured with `runs-on: self-hosted`.
- Keep the runner binary updated (current runner releases are required for Node 20 based actions).
- Docker is not required by the current workflows.

### Runner Host Requirements
- OS: Linux (recommended Ubuntu 22.04+), macOS 14+, or Windows 11/Server 2022.
- Tools: `git`, `bash`, `curl`, `tar`, `unzip`, `ca-certificates`.
- Network egress to `github.com` and `api.github.com`.
- Disk headroom for Node installs (`actions/setup-node`) and Playwright browser binaries.

### Playwright Dependencies
- CI installs Chromium with `npx playwright install chromium`.
- Linux hosts must preinstall browser system libraries once (as an admin), for example:
  1. Check out the repo on the runner host.
  2. Run `npm ci`.
  3. Run `sudo npx playwright install-deps chromium`.
- macOS/Windows hosts typically only need `npx playwright install chromium`.

### Register Runner (Repository Level)
1. Open GitHub repository settings: `Settings -> Actions -> Runners`.
2. Click `New self-hosted runner`.
3. Choose the host OS and architecture.
4. Follow the generated commands on the runner host:
   1. Create/download runner directory.
   2. Extract the runner package.
   3. Run `./config.sh --url <repo-url> --token <one-time-token>` (or `config.cmd` on Windows).
   4. Start the runner with `./run.sh` (or install as a service with `./svc.sh install && ./svc.sh start` on Linux/macOS, `run.cmd`/service on Windows).
5. Confirm the runner status shows `Idle` in `Settings -> Actions -> Runners`.

### Local Validation Sequence (same commands as CI jobs)
1. `npm ci`
2. `npm run check`
3. `npm run size:check`
4. `npx playwright install chromium`
5. `npm run test:e2e`
