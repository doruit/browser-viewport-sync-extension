# Contributing to Responsive Demo Sync

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/doruit/browser-viewport-sync-extension.git
   cd responsive-demo-sync
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Build the extension**:
   ```bash
   npm run build
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style of the project

3. **Test your changes**:
   - Load the extension in Chrome: `chrome://extensions/`
   - Test with real websites
   - Check console logs for errors
   - Verify sync behavior

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Commit Message Convention

We follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes

### Pull Request Process

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub with:
   - Clear title and description
   - Reference any related issues
   - Screenshots/GIFs for UI changes
   - Test results

3. **Code review**: Address any feedback from maintainers

4. **Merge**: Once approved, your PR will be merged

## Code Style

- Use TypeScript for all new code
- Follow the existing code structure
- Add JSDoc comments for public methods
- Use meaningful variable names
- Keep functions focused and small

## Testing

Currently, testing is manual. When submitting a PR:

1. Test on multiple websites (news sites, blogs, e-commerce)
2. Test different viewport sizes
3. Test navigation sync
4. Test service worker restarts (wait 30s after enabling sync)
5. Check console for errors

## Areas for Contribution

### High Priority

- **Better block detection**: Improve heuristics for finding content blocks
- **Auto-detect route changes**: Hook into History API
- **Performance optimization**: Profile and optimize block matching
- **Test coverage**: Add automated tests

### Medium Priority

- **Multiple sync pairs**: Support more than one desktop/mobile pair
- **Bidirectional sync**: Allow both tabs to be master
- **Custom selectors**: Per-domain block selector configuration
- **Settings UI**: Confidence thresholds, scroll behavior tuning

### Nice to Have

- **Machine learning**: ML-based block matching
- **Analytics dashboard**: Sync quality metrics
- **Dark mode**: UI theme
- **Internationalization**: Multi-language support

## Bug Reports

When filing a bug report, please include:

1. **Chrome/Edge version**
2. **Extension version**
3. **Website URL** where the issue occurs
4. **Steps to reproduce**
5. **Expected behavior**
6. **Actual behavior**
7. **Console logs** (from service worker and content script)
8. **Screenshots** (if applicable)

## Feature Requests

Feature requests are welcome! Please:

1. Check if the feature already exists
2. Describe the use case clearly
3. Explain how it would improve the extension
4. Consider if it fits the project scope

## Questions

If you have questions:

1. Check the [README](README.md)
2. Check [ARCHITECTURE](ARCHITECTURE.md) for technical details
3. Open a GitHub Discussion
4. File an issue with the `question` label

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
