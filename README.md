<p align="center"><img src="public/logo.svg" width="88" height="88" alt="OpenComponent logo" /></p>
<h1 align="center">OpenComponent</h1>
<p align="center">Compose React screens visually with real components.</p>
<p align="center"><strong>English</strong> · <a href="README.ko.md">한국어</a></p>

OpenComponent is an open source visual workspace for building React interfaces from curated components. Define your design tokens, drag components onto a screen, preview the result, and export a standalone React project.

It is an early local prototype, inspired by familiar design-tool workflows. Projects are saved in your browser; no account or backend is required.

## Features

- **73 catalog entries:** 66 shadcn components and recipes, five local elements including Footer, and two adapted Magic UI metrics. See the [catalog contract](docs/SHADCN_CATALOG.md) for supported properties and limitations.
- **Multiple screens:** add, rename, duplicate, delete and switch screens with independent trees and shared design tokens.
- **Visual composition:** drag components and layers, edit content and layout, and undo or redo changes.
- **Design.md:** configure light/dark colors, fonts, spacing, radius and shadow before composing your interface.
- **Flexible workspace:** resize either side panel, remember panel widths, and fit the entire screen to the available canvas.
- **Interactive Preview:** use the full window or real 375/768/1280px viewports without changing saved component values.
- **React export:** download source files, component implementations, theme CSS and pinned direct dependencies as a Vite project.

## Quick start

Use Node.js **22.12 or later** and npm.

```sh
git clone https://github.com/hoddukzoa12/OpenComponent.git
cd OpenComponent
npm ci
npm run dev
```

Open the local URL printed by Vite. The first visit opens a settings-screen starter. Choose **Projects → New project → Blank screen** for an empty canvas.

## Workflow

1. Open **Design** to configure tokens or import/edit `Design.md`.
2. Search **Components**, then click to insert into the selected container or drag to a drop target. Search **Footer** for editable branding, links and copyright text.
3. Use **Screens**, **Layers** and **Properties** to organize the interface and edit content. Layout overrides use mobile-first breakpoints at 768px and 1024px.
4. Drag the inner edge of either panel to resize it. Double-click the divider to reset it. **Fit screen** fits both axes and restores the screen position; fixed zoom levels let you inspect long pages.
5. Open **Preview** to try interactions and responsive widths. Preview changes are temporary; Properties sets saved values.
6. Choose **Export → React project .zip**. Unzip it, run `npm install`, then `npm run dev`. Run `npm run build` to create a production build.

| Action | Shortcut |
| --- | --- |
| Undo / redo | Cmd/Ctrl+Z / Cmd/Ctrl+Shift+Z |
| Duplicate selection | Cmd/Ctrl+D |
| Delete selection | Delete or Backspace |
| Close overlay / leave Preview | Escape |
| Resize focused panel divider | Left/Right; Shift for larger steps; Home/End for bounds |

## Storage and current limits

Projects are stored in IndexedDB on the current browser and origin. Export a project JSON backup to move or preserve your work; restore it through **Projects → Import project**. Clearing browser storage removes local projects.

The editor targets desktop browsers. A project supports up to 50 screens, 500 nodes and 20 nesting levels. Component recipes expose selected editable properties, not every primitive API or arbitrary child composition. Footer follows page flow rather than being fixed to the browser bottom.

Forms and other interactions are local examples. Connect your own APIs, authentication and persistence after export. Fonts must be installed locally or bundled in the exported project. Table editing uses simple comma-separated rows, not quoted CSV. Editing exported source cannot be synchronized back into the editor. Exported `Design.md` is a record; edit `src/styles.css` to change the running theme.

The catalog is bundled and reviewed. Per-component bundle splitting, broader browser/accessibility coverage, and deeper editing of complex recipes remain work in progress.

## Development

```sh
npm test
npm run build
npm run verify:export
```

The export check generates a two-screen, all-component project in a temporary directory, installs its dependencies and builds it. It requires npm registry access. `npm run format` formats project code while preserving excluded upstream sources.

Core contracts live in `src/core/model.ts`, the catalog in `src/core/catalog.ts`, adapters in `src/core/systems.ts`, and source generation in `src/core/generate.ts`. Paperthin guides the development and QA workflow; React runs the application. Local agent configuration and raw QA records are not required to build the project.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development, review and component contribution guidance, and [SOURCES.md](docs/SOURCES.md) for provenance.

## Roadmap

- Add Astryx as a separate design system with its own theme adapter and exporter.
- Expose catalog search, design settings, screen editing and export through MCP.
- Improve component coverage, composition controls and bundle size.

Cloud collaboration and source-code round trips are not implemented.

## License

Original OpenComponent code is licensed under [Apache License 2.0](LICENSE). See [NOTICE](NOTICE). Bundled third-party code retains its upstream licenses, including MIT for shadcn/ui and Magic UI and ISC for the Lucide logo icon. See [third-party notices](public/THIRD_PARTY_LICENSES.txt) and the [source records](docs/SOURCES.md).
