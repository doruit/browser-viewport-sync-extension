# Publishing Checklist

This checklist helps ensure the repository is ready for GitHub publication.

## Before Publishing

### 1. Update Repository Information

- [ ] Update `package.json`:
  - [ ] Replace `doruit` with your GitHub username
  - [ ] Update `author` field with your name
  - [ ] Verify version number

- [ ] Update `README.md`:
  - [ ] Replace `doruit` with your GitHub username in URLs
  - [ ] Add screenshots or demo GIF
  - [ ] Verify all links work

- [ ] Update `LICENSE`:
  - [ ] Replace `[Your Name]` with your actual name

- [ ] Update `CONTRIBUTING.md`:
  - [ ] Replace `doruit` with your GitHub username

### 2. Verify Build

- [ ] Run `npm install` successfully
- [ ] Run `npm run build` successfully
- [ ] Load extension in Chrome and verify it works
- [ ] Test all major features:
  - [ ] Tab pairing
  - [ ] Scroll sync
  - [ ] Navigation sync
  - [ ] Settings persistence
  - [ ] Service worker restart

### 3. Documentation

- [ ] README is complete and accurate
- [ ] ARCHITECTURE.md explains the technical design
- [ ] TROUBLESHOOTING.md covers common issues
- [ ] QUICK_START.md provides a quick getting started guide
- [ ] CHANGELOG.md is up to date
- [ ] All code has appropriate comments

### 4. Code Quality

- [ ] No console.errors in production
- [ ] No TODO comments left unresolved
- [ ] TypeScript compiles without errors
- [ ] Code follows consistent style
- [ ] No secrets or API keys in code

### 5. GitHub Setup

- [ ] Create repository on GitHub
- [ ] Add repository description
- [ ] Add topics/tags: chrome-extension, typescript, responsive-design, etc.
- [ ] Set up GitHub Pages (if needed)
- [ ] Add social preview image (1280x640px)

### 6. Initial Commit

```bash
git init
git add .
git commit -m "feat: initial commit - responsive demo sync extension v1.0.0"
git branch -M main
git remote add origin https://github.com/doruit/browser-viewport-sync-extension.git
git push -u origin main
```

### 7. Create First Release

- [ ] Tag the release:
  ```bash
  git tag -a v1.0.0 -m "Release v1.0.0"
  git push origin v1.0.0
  ```

- [ ] Create GitHub Release:
  - [ ] Go to repository → Releases → Create new release
  - [ ] Tag: v1.0.0
  - [ ] Title: "v1.0.0 - Initial Release"
  - [ ] Description: Copy from CHANGELOG.md
  - [ ] Upload `browser-viewport-sync-extension.zip` as release asset
  - [ ] Publish release

### 8. Optional: Chrome Web Store

If you want to publish to Chrome Web Store:

- [ ] Create developer account ($5 one-time fee)
- [ ] Prepare store listing:
  - [ ] Screenshots (1280x800 or 640x400)
  - [ ] Promotional images
  - [ ] Detailed description
  - [ ] Category selection
- [ ] Upload extension package
- [ ] Submit for review

### 9. Post-Publishing

- [ ] Update repository README with:
  - [ ] Link to releases
  - [ ] Installation badge (if published to Chrome Web Store)
  - [ ] Build status badge
- [ ] Share on social media (optional)
- [ ] Star your own repository (why not?)

## Regular Maintenance

### For Each New Release

- [ ] Update version in `package.json`
- [ ] Update version in `public/manifest.json`
- [ ] Update CHANGELOG.md
- [ ] Create git tag
- [ ] Create GitHub release
- [ ] Upload new ZIP file

## Notes

- Remember to never commit sensitive data
- Keep the CHANGELOG updated with each change
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Test thoroughly before each release
