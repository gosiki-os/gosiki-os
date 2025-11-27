# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
