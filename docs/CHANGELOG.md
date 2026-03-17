# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-17

### Added
- Initial release
- Semantic content block detection and matching
- Automatic scroll synchronization between desktop and mobile viewports
- Automatic navigation synchronization
- Master/follower mode selection
- Session state persistence across page refreshes
- Service worker restart resilience
- Tab validation to prevent errors when tabs are closed
- Intelligent fallback strategy (semantic → order → global progress)
- Loop prevention for stable scrolling
- Comprehensive logging for debugging
- Extension popup UI for easy configuration

### Features
- Multi-signal matching algorithm with weighted scoring:
  - Heading similarity (30%)
  - Document order (25%)
  - Text content (20%)
  - Structure (15%)
  - Position (10%)
- Three-level fallback strategy for uncertain matches
- Throttled scroll events (100ms) for performance
- Support for up to 100 blocks per page
- Handles responsive reordering and content changes

### Documentation
- Complete README with architecture and usage guide
- ARCHITECTURE.md with technical details
- QUICK_START.md for getting started quickly
- TROUBLESHOOTING.md for common issues
- PROJECT_SUMMARY.md with overview

## [Unreleased]

### Planned Features
- Auto-detect route changes via History API
- Multiple sync pairs support
- Bidirectional sync option
- Machine learning for block matching
- Custom block selectors per domain
- Performance profiling dashboard
- Confidence threshold tuning UI
- Automated tests
