# Release Guide

This document describes the release process for Gosiki OS.

---

## Automated Release Flow

Gosiki OS uses automated npm publishing via GitHub Actions. The workflow is triggered when you push a version tag.

### Quick Release (3 steps)

```bash
# 1. Bump version (automatically updates package.json and creates git tag)
npm version patch    # 0.1.0 → 0.1.1 (bug fixes)
# or
npm version minor    # 0.1.0 → 0.2.0 (new features)
# or
npm version major    # 0.1.0 → 1.0.0 (breaking changes)

# 2. Push tag to GitHub (this triggers automated npm publish)
git push origin main --tags

# 3. Done! GitHub Actions will:
#    - Verify version matches tag
#    - Publish to npm automatically
#    - Create GitHub Release with notes
```

That's it! No manual `npm publish` needed.

---

## Detailed Release Process

### Prerequisites

Before releasing, ensure:
- ✅ All changes are committed and pushed to `main`
- ✅ Tests are passing
- ✅ CHANGELOG.md is updated with release notes
- ✅ You have push access to the repository

### Step 1: Update CHANGELOG.md

Add release notes to `CHANGELOG.md`:

```markdown
## [0.1.2] - 2025-11-29

### Added
- New feature description

### Fixed
- Bug fix description
```

Commit the changes:

```bash
git add CHANGELOG.md
git commit -m "docs: update CHANGELOG for v0.1.2"
git push origin main
```

### Step 2: Bump Version

Use `npm version` to bump the version:

```bash
# For patch releases (bug fixes)
npm version patch -m "chore: bump version to %s"

# For minor releases (new features)
npm version minor -m "feat: bump version to %s"

# For major releases (breaking changes)
npm version major -m "feat!: bump version to %s"
```

This command will:
1. Update `package.json` version
2. Create a git commit
3. Create a git tag (e.g., `v0.1.2`)

### Step 3: Push Tags

Push the tag to trigger the automated release:

```bash
git push origin main --tags
```

### Step 4: Automated Publishing

GitHub Actions will automatically:

1. **Verify Version**: Check that tag version matches `package.json`
2. **Publish to npm**: Run `npm publish --access public`
3. **Create GitHub Release**: Generate release notes from CHANGELOG.md

Monitor the workflow at: https://github.com/gosiki-os/gosiki-os/actions

---

## Version Strategy

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (0.1.0 → 0.1.1): Bug fixes, documentation updates
- **Minor** (0.1.0 → 0.2.0): New features, backwards-compatible changes
- **Major** (0.1.0 → 1.0.0): Breaking changes, API redesign

### Gosiki OS Version Mapping

| Version | Phase | Milestone |
|---------|-------|-----------|
| 0.1.x | Phase 1a | Port Manager only |
| 0.2.x | Phase 1b | + Process Manager |
| 0.3.x | Phase 1c | + Folder Policy |
| 0.4.x | Phase 1d | + Commands, Agents |
| 1.0.0 | L2 Complete | All core features stable |

---

## GitHub Actions Setup

### Required Secret

Add `NPM_TOKEN` to repository secrets:

1. Go to https://www.npmjs.com/settings/[your-username]/tokens
2. Create a new **Automation** token
3. Copy the token
4. Go to https://github.com/gosiki-os/gosiki-os/settings/secrets/actions
5. Add secret: `NPM_TOKEN` = `[your-token]`

The workflow is located at: `.github/workflows/publish.yml`

---

## Troubleshooting

### Version Mismatch Error

If the workflow fails with "Tag version does not match package.json version":

```bash
# Delete the tag locally and remotely
git tag -d v0.1.2
git push origin :refs/tags/v0.1.2

# Fix package.json version
npm version 0.1.2 --no-git-tag-version

# Commit and create tag again
git add package.json
git commit -m "chore: fix version to 0.1.2"
git tag v0.1.2
git push origin main --tags
```

### npm Publish Failed

Check:
1. `NPM_TOKEN` secret is set correctly
2. Token has publish permissions
3. Package name `@gosiki-os/port-manager` is available
4. You are a collaborator on the npm package

### Manual Publish (Emergency)

If automated publishing fails, you can publish manually:

```bash
cd gosiki-oss
npm whoami  # Verify you're logged in
npm publish --access public
```

---

## Rollback a Release

If you need to rollback a release:

```bash
# Deprecate the broken version on npm
npm deprecate @gosiki-os/port-manager@0.1.2 "This version has critical bugs, use 0.1.3 instead"

# Delete the GitHub release (optional)
gh release delete v0.1.2

# Release a fixed version
npm version patch
git push origin main --tags
```

**Note**: Never use `npm unpublish` after 24 hours - it's better to deprecate and release a fix.

---

## Related Documentation

- [CHANGELOG.md](../CHANGELOG.md) - Version history
- [WORKFLOW.md](WORKFLOW.md) - Development workflow
- [Semantic Versioning](https://semver.org/)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
