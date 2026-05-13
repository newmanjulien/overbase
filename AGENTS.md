# Agent Instructions

- Never write or add tests
- All data in the db can be nuked or reseeded
- Destructive changes are fine
- Backwards compatibility is not important
- Maximally clean architecture matters
- Patching things quickly is usually wrong
- Intuitive mental model is important
- Readable code is important

- This is a new app I'm building
- It currently mostly is an opportunity format builder
- Later we'll add many other features (current routes which have just and empty state now)
- The builder relies on separate apps
- Check out src/builder-apps/README.md to understand how those separate apps work

- There's a package at packages/builder-sdk
- That package is supposed to be a public package
- For now, I'm just hosting it locally in all the apps
- But it needs to be identical in all apps
