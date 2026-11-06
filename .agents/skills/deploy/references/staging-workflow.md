# Staging Deployment Workflow Reference

This guide details best practices, strategies, and recovery operations when deploying builds to staging.

---

## 1. Staging Concepts & Targets

### Concept A: Git Staging Area
- In Git, the **staging area** (or index) holds formatted changes that have been reviewed and prepared for the next commit.
- Staging all verified files (`git add -A`) ensures that only tested, build-ready code is tracked and committed.
- Command: `git add -A` followed by `git status` or `git diff --cached`.

### Concept B: Staging Branch / Environment
- A **staging branch** (`staging`) serves as a pre-production integration target where all feature work is validated against real or simulated production environments.
- Typical lifecycle:
  `feature/xyz` -> `test` -> `build` -> `staging branch` -> CI/CD staging deployment -> `production`.
- Remote target: `origin/staging`.

---

## 2. Failure Handling & Abort Policy

1. **Test Failures**:
   - Never force a build when `npm test` fails.
   - Investigate test failures immediately by inspecting stack traces.
   - If tests are flaky, quarantine the flaky test in an isolated issue rather than disabling the whole test suite.

2. **Build Failures**:
   - Check bundler errors (`vite build` logs, missing exports, JSX/TS errors, missing environment variables).
   - Clean stale caches:
     ```powershell
     rm -r dist
     npm run build
     ```

3. **Staging Conflicts**:
   - If pushing to `staging` results in a merge conflict:
     ```powershell
     git fetch origin staging
     git merge origin/staging
     # Resolve conflicting files
     git add -A
     git commit -m "fix: resolve staging conflicts"
     git push origin staging
     ```

---

## 3. Rollback Procedure

If a deployed staging build contains a critical bug:
1. Revert to the last known healthy commit:
   ```powershell
   git revert HEAD
   git push origin staging
   ```
2. Re-run tests and rebuild to confirm the healthy state is restored:
   ```powershell
   npm test
   npm run build
   ```
