# Bundled component provenance

Registry files were compared byte-for-byte against the following pinned source revisions before adaptation.

| Source                                                                                             | Revision                                   | Original path                                | Registry                                                 |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------- | -------------------------------------------------------- |
| [shadcn/ui](https://github.com/shadcn-ui/ui/tree/3ba91b1cc83e1bbe4ab35a422ff2a694849c5048)         | `3ba91b1cc83e1bbe4ab35a422ff2a694849c5048` | `apps/v4/registry/new-york-v4/ui/{name}.tsx` | `https://ui.shadcn.com/r/styles/new-york-v4/{name}.json` |
| [Magic UI](https://github.com/magicuidesign/magicui/tree/ec1cce6c4192c0aaac279dd7e53537ccd5c99d44) | `ec1cce6c4192c0aaac279dd7e53537ccd5c99d44` | `apps/www/registry/magicui/{name}.tsx`       | `https://magicui.design/r/{name}.json`                   |

The complete shadcn inventory, source paths, hashes and local adaptations are recorded in the [source manifest](catalog/shadcn-sources.json). The [catalog contract](SHADCN_CATALOG.md) defines the 61 registry UI entries and five additional recipes or documentation entries. Questionnaire uses the same pinned revision's `bases/radix/ui` source; the table above gives the default registry path.

Magic UI components: number-ticker, animated-circular-progress-bar.

Both sources carry MIT licenses. Complete notices are maintained in [THIRD_PARTY_LICENSES.txt](../public/THIRD_PARTY_LICENSES.txt) and are included in React ZIP exports.

## Local adaptations

- shadcn's `cn` imports resolve to the local `clsx`/`tailwind-merge` helper. Dialog's registry Button import resolves to the bundled Button.
- Dialog and Select portals inherit an optional project portal container. Input, Textarea and Dialog accept an optional simulated viewport through context so canvas breakpoints match standalone media queries.
- Number Ticker uses the `foreground` token instead of hardcoded black/white.
- Circular Progress receives project `primary` and `muted` values through its public color props. Its displayed range is constrained to 0–100 by the editor and exporter.
- Dependencies are determined from source imports and pinned from the application lockfile. Registry dependency lists alone omit some imports.
- Extended recipes use reviewed official primitives, including Base UI for Combobox. Their import, theme and viewport adaptations are listed per file in the source manifest.

No Magic UI Pro templates or other paid assets are bundled.

## Application logo and icons

The application header and [README logo](../public/logo.svg) use Lucide’s Boxes icon with the existing OpenComponent colors and shape. Lucide is installed at the version recorded in [package-lock.json](../package-lock.json). Its ISC notice and the MIT notice for Feather-derived icons are included in [third-party notices](../public/THIRD_PARTY_LICENSES.txt). Original OpenComponent code is Apache-2.0; these upstream notices remain unchanged.
