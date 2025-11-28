# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.5] - 2025-11-28

### Fixed
- **Help command** now displays registry location with demo mode support (npm-controlled postinstall replaced with CLI message)

### Changed
- Registry location now shown in `--help` command with `GOSIKI_DEMO_MODE` support

## [0.1.4] - 2025-11-28

### Fixed
- **Post-install script** now respects `GOSIKI_DEMO_MODE` environment variable for username masking

## [0.1.3] - 2025-11-28

### Added
- **Label/Group support** - Assign labels to ports with `--label` flag (e.g., `--label frontend`)
- **Demo mode** - Username masking with `GOSIKI_DEMO_MODE=true` for recording demos
- **Post-install message** - Show registry location and quick start guide after installation
- **Demo scripts** - Added `scripts/demo.sh` for recording demonstration videos
- Enhanced port status display showing PID for managed ports
- System-wide port status visibility in `--list` command
- Distinction between managed and not managed ports in output
- Registry path display in all commands (acquire, list, release)

### Fixed
- **Critical**: Registry check now prevents double port allocation
- Port allocation now verifies both system AND registry before assigning ports
- Automatic cleanup of stale registry entries when processes end

### Changed
- CLI help updated to v0.1.3 with new label examples
- Registry schema now includes optional `label` field
- Username masking now controlled by `GOSIKI_DEMO_MODE` environment variable (default: real username shown)

## [0.1.2] - 2025-11-28

### Fixed
- CLI execution check for cross-platform compatibility (Windows, macOS, Linux)
- Commands (`--help`, `--list`, `--release`) now work correctly with npx

## [0.1.1] - 2025-11-28

### Added
- Demo CLI for interactive Port Manager demonstration
- Basic app example with production migration path
- Quick Start section in README.md
- Examples directory with working code samples
- `bin/gosiki-demo.js` executable entry point
- Comprehensive English documentation for all examples

### Changed
- Updated README.md with comprehensive Quick Start guide
- Version bump from 0.1.0 to 0.1.1
- Improved documentation structure for better accessibility

### Fixed
- Missing Quick Start section in documentation
- Incomplete example documentation
- Migration path clarity from demo to production

## [0.1.0] - 2025-11-26

### Added
- Initial Port Manager implementation (Phase 1a)
- Core port allocation and release functionality
- Dashboard visualization with grouped display
- Group allocation support for multiple services
- Windows 10/11 support (no admin required)
- Port registry management (`~/.gosiki-os/port-registry.json`)
- CLI interface for port management operations
- Process detection and port conflict resolution
- Comprehensive error handling and logging

### Technical Details
- Port range: 3000-9999 (configurable)
- Maximum 5 concurrent operations
- Automatic cleanup on process termination
- Cross-platform support (Windows, macOS, Linux planned)

---

## Version Strategy

- **v0.x.x**: Development phases (Phase 1a, 1b, 1c, 1d)
- **v1.0.0**: L2 Runtime Layer completion (all core features)
- **v2.0.0+**: L3 Application Layer (IDE integrations)

### Phase Roadmap

| Version | Phase | Modules | Status |
|---------|-------|---------|--------|
| v0.1.x | Phase 1a | port-manager, examples, demo-cli | current |
| v0.2.x | Phase 1b | + process-manager | planned |
| v0.3.x | Phase 1c | + folder-policy | planned |
| v0.4.x | Phase 1d | + commands, agents, execution-engine | planned |
| v1.0.x | L2 Complete | All core features | future |

---

## Links

- [GitHub Repository](https://github.com/gosiki-os/gosiki-os)
- [Documentation](docs/)
- [Examples](examples/)
