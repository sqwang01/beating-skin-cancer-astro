---
name: browse-view
description: Open the rendered version of an Astro page in the browser. Use when the user wants to see the actual render of a page (not the code) — e.g. "browse view", "show me this page", "open this in the browser", "view the render". Starts the dev server if needed, maps a src/pages file to its route, and opens it.
---

# Browse view

Opens the live-rendered version of a page from this Astro site in the user's default browser
(macOS `open`). Also prints the URL so it can be pasted into VS Code's **Simple Browser**
(Command Palette → "Simple Browser: Show") for an in-editor preview.

## Steps

1. **Make sure the dev server is up.**
   - Run `astro dev status`.
   - If it reports not running, start it: `astro dev --background`, then re-run `astro dev status`.
   - Determine the base URL + port. Default is `http://localhost:4321`. If `astro dev status`
     or `astro dev logs` shows a different port (Astro auto-bumps when 4321 is taken), use that.

2. **Pick the target route.**
   - **If the user passed an argument** (e.g. `/browse-view prevention` or
     `/browse-view /basal-cell-carcinoma/types`): treat it as the route. Strip a leading slash,
     then re-add one. Done.
   - **Otherwise use the file the user currently has open in the IDE.** Look for the most recent
     `<ide_opened_file>` or `<ide_selection>` context in the conversation and use that path. Only
     ask the user to name a route if there is genuinely no such context and no argument — do not
     ask when an `<ide_opened_file>` path under `src/pages/` is available.
     It must live under `src/pages/`. Map it to a route:
     - Drop the `src/pages/` prefix and the `.astro` / `.md` / `.mdx` extension.
     - `index` → the parent directory (`src/pages/basal-cell-carcinoma/index.astro` → `/basal-cell-carcinoma`; `src/pages/index.astro` → `/`).
     - `src/pages/prevention.astro` → `/prevention`.
     - `src/pages/squamous-cell-carcinoma/advanced-scc/foo.astro` → `/squamous-cell-carcinoma/advanced-scc/foo`.
   - **If the open file is a dynamic route** (`[slug].astro`, `[...path].astro`) or isn't under
     `src/pages/`, don't guess — ask the user which concrete route they want.

3. **Open it.**
   - Build the full URL: `<base>` + route.
   - Run `open "<url>"` to launch the default browser.
   - Print the URL on its own line in the reply, and add one line:
     "In-editor: Command Palette → 'Simple Browser: Show' → paste this URL."

4. Keep the reply to the URL, how it was opened, and (if you started it) that the dev server is
   now running in the background. Don't dump server logs unless something failed.

## Notes

- This skill only *views* pages — it never edits the page, the server config, or anything else.
- Hot reload is automatic: once a page is open, saved edits refresh it with no re-run.
- If `open` fails (headless / SSH), just print the URL and the Simple Browser instruction.
- To stop the server later: `astro dev stop`.
