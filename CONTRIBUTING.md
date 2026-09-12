# Contributing to OpenComponent

Thanks for helping improve OpenComponent. Read the [README](README.md) and [catalog contract](docs/SHADCN_CATALOG.md) before starting. Bug reports, documentation, accessibility improvements and reviewed component integrations are welcome.

## Set up

1. Fork the repository and clone your fork.
2. Use Node.js 22.12 or later and run `npm ci`.
3. Create a branch for your change and run `npm run dev`.

Local agent skills and private QA files are optional development aids; they are not required to contribute.

## Report a bug or propose a change

For bugs, include the steps to reproduce, expected and actual behavior, browser/version, viewport size and relevant screenshots. Use a minimal example with synthetic data. Remove credentials and personal information from project JSON files and logs.

For substantial features, open an issue describing the user problem, proposed behavior and compatibility implications before implementing a large change. Astryx and MCP are roadmap items, not existing integrations.

## Validate your change

```sh
npm test
npm run build
npm run verify:export
```

The export check installs and builds a generated project and needs network access. For editor changes, exercise the real browser flow. For output changes, build and run a freshly exported project. Check light/dark themes, relevant widths, keyboard behavior and persistence when your change affects them. Automated rendering alone does not establish usable interactions.

Use `npm run format` to format project-owned files. Do not reformat unrelated upstream sources or commit generated builds, node_modules, local agent configuration or private QA artifacts.

## Open a pull request

Target `main`. Explain the problem, the resulting behavior and the checks you ran. Include before/after screenshots for visible changes and disclose checks you could not run. Keep unrelated refactors out of the PR, and update both README languages when user-facing instructions change.

## Add a component

1. Confirm redistribution terms and record the repository, pinned revision, original path and license in [SOURCES.md](docs/SOURCES.md) and the relevant source manifest. Preserve upstream copyright and license notices.
2. Add reviewed code under `src/components/ui`, using local utility imports. Review dependencies for theme, interaction and export compatibility. Official recipes may use Radix or Base UI. Do not execute arbitrary registry code or fetch component code at runtime.
3. Define defaults and editable fields in `src/core/extended-catalog.ts`, catalog metadata in `src/core/catalog.ts`, rendering in `src/components/ui/extended-node.tsx` or a dedicated shared renderer, and a static thumbnail in `src/components/ExtendedThumbnail.tsx`. New node kinds or containers also require validation, containment and source generation support.
4. Use project theme tokens. Portals must inherit the project theme through `useProjectPortal()` where applicable. Describe supported props and child slots accurately.
5. Add the component to export coverage. Verify actual interactions in the editor, Preview and a freshly generated standalone app. Update source hashes when vendored files change.

Local OpenComponent blocks and third-party primitives have different provenance. Keep their license metadata accurate; an Apache-licensed project does not replace upstream licenses.

## Add a design system

Implement the `DesignSystemAdapter` contract with its own catalog, document identifier, theme mapping and exporter. Each project selects one system. Do not silently convert or mix incompatible component APIs between systems.

## Preserve editing contracts

- Persist document changes through validated store operations so they remain undoable. UI selection, panel sizes and temporary Preview state belong outside the document.
- Keep screen identity stable, component trees independent and no-op operations out of undo history. Invalid imports must preserve the current project.
- Use the central theme schema for new tokens. Keep editor, Preview and export behavior aligned.
- Escape user content in generated source, include the dependency/source closure and required notices, and keep exported apps independent of the editor runtime.

## Licensing contributions

Unless explicitly stated otherwise, contributions to project-owned code are submitted under [Apache License 2.0](LICENSE), including its contribution terms. Only contribute material you have the right to submit. Clearly identify third-party additions, retain their original licenses and update [third-party notices](public/THIRD_PARTY_LICENSES.txt). Do not include paid or non-redistributable templates.
