# Folio CV Studio

Open `index.html` for the homepage or `builder.html` for the CV studio. Both work directly in a browser. For public hosting, upload both HTML files, all root `.css` and `.js` files, and the entire `assets` folder together to your static hosting provider. The `.cjs` scripts are development tools and are not required for hosting.

The homepage includes an AI-generated product visual, real template previews, filters, and application-type shortcuts. It does not call an AI writing service or claim to generate CV text with AI. Template selections preserve existing details.

Photo uploads open a Cropper.js editor with drag-to-position, zoom, rotation, horizontal flip, brightness, and contrast. Apply commits changes; Cancel or Escape leaves the saved photo unchanged. Originals are resized to at most 1600 pixels on the longest edge and retained in drafts and JSON backups for later adjustments. The final square crop is 480 by 480 pixels. Circular templates display the center of this square crop.

The site opens in dark mode. The sun/moon button switches themes and remembers the visitor's preference. The CV preview and PDF retain their paper colors. An essential-details indicator links to missing fields; it measures completeness, not CV quality or hiring outcomes.

Public creator details live in `owner.js`, separate from CV drafts. Unconfigured links stay hidden. The supplied owner photo is in `assets/owner.png`. The creator section never appears in exported CVs.

Features include 140 template choices (16 original layouts and 124 additional layout, palette, typography, and portrait variants), five application types, photo uploads, custom accent colors, typography controls, live preview, optional CV sections, and print-to-PDF export. The first six designs interpret the supplied CV reference: Timeline, Signature, Harbor, Slate, Sage, and Contrast. The template browser supports search and professional, student, and creative filters. Selecting a template applies its coordinated palette and type pairing while preserving CV details. Custom typography and colors remain available after selection. Internship, graduate, and academic modes prioritize education and projects. Changing application type preserves entered details; the Example CV button replaces them after confirmation.

Drafts and compressed photos are saved in the visitor's browser. The download button exports an editable JSON backup; Import draft restores it. There is no account system or server database. Interface fonts are loaded from Google Fonts with local font fallbacks. Signature's Allura script font is bundled locally under the SIL Open Font License.

For PDF export, choose Save as PDF in the browser print dialog. Use A4 portrait, scale 100%, margins None, and disable browser headers and footers. Enable background graphics if your browser offers that option. The print layout scales all template elements together to a full 210 x 297 mm sheet, with full-height sidebars on short CVs. Choose 1 or 2 pages in the editor. Sections flow to page two, splitting entries or long descriptions when necessary. The document fits uniformly down to 72% of its design scale; content that still cannot fit triggers an explicit warning and pauses the Export PDF button. The complete source text remains available in the overflow panel and form. Screen zoom does not change PDF dimensions.

`verify.cjs` checks the CV workflow; `verify-studio.cjs` checks owner links, theme persistence, progress navigation, print isolation, and responsive layouts; `verify-home-photo.cjs` checks the homepage and photo editing workflow; `verify-designs.cjs` checks all layouts, content retention, template browsing, long names, and print behavior. They use Playwright and a locally installed Chrome. `capture-templates.cjs` regenerates all actual CV previews using a fictional sample portrait, which is never inserted into visitors' drafts. Do not upload development dependencies or test outputs to your hosting provider.

`node verify-a4.cjs` additionally exports all sixteen templates from desktop and mobile viewport sizes, then checks the actual PDFs for A4 dimensions, single-page short CVs, readable main text, and complete multi-page content. Its companion `verify-pdf.py` requires PyMuPDF in the local test-only folder: `python -m pip install --target node_modules/pdf-test-tools pymupdf`. Neither test file nor this dependency is needed for hosting.


## Fixed A4 editor and expanded collection

`canvas-model.js` validates saved page and block settings. `canvas-editor.js` derives one or two fixed pages from the existing renderer, keeps columns and semantic sections, and provides page navigation, fit/zoom, margins, section spacing, block movement, block width, text size, line spacing, bold, italic, alignment, section ordering, and portrait sizing. Text continues to be edited through the existing form. New settings travel with local drafts and JSON backups; old drafts receive defaults. No runtime dependency was added.

`canvas-editor.css` owns physical 210mm ? 297mm sheets, visual zoom, and print page breaks. `canvas-desktop.css` preserves desktop document rules at small viewports (it is derived from the existing design styles); the surrounding interface stays responsive. `collection.css` styles the new variants listed in `templates.js`. Thumbnails are real rendered sample CVs, regenerated using `node capture-templates.cjs`. These are locally implemented template variants inspired by the reference images, not a downloaded or exhaustive Canva catalog.

Run `node verify-canvas.cjs` and then `python verify-canvas-pdf.py` for the current fixed-page contract. These check all 140 templates at desktop/mobile widths, page counts, content retention, overflow protection, mixed sections, images, formatting, zoom, persistence, live form updates, and actual PDF sizes and text. The older A4 verification script describes the previous unlimited-length behavior and is superseded by these checks.

Limitations: this is a section editor, not a full freeform design application. Section order changes within its template column. Moving blocks may overlap other blocks; reset the block to restore automatic positioning. Out-of-page content raises an overflow warning. Oversized content needs shortening or a simpler template when it cannot fit in two pages. Use the app's Export PDF button so its overflow guard can run; the browser's own print shortcut bypasses that button. Print settings can override CSS, so use A4, 100% scale, no margins or browser headers, and background graphics enabled.


## ATS readiness

The bottom of the left panel now includes an ATS readiness tool. `ats.js` provides a single-column text layout, visible-content text export, and user-entered keyword comparison; `ats-panel.js` provides the toggle and live checklist, styled by `ats.css`. ATS mode is saved in drafts and imports. It keeps the selected designer template and photo intact, temporarily omits graphics, and ignores manual block placement. Normal formatting returns when the toggle is disabled. It uses standard headings and the existing selectable-text A4 PDF export. No external ATS API, model, or new dependency is involved.

Keyword comparison is case-insensitive token/phrase matching against included CV fields only, capped at 60 distinct terms. Terms such as C++, C#, .NET, and JavaScript remain distinct. It does not infer synonyms, judge qualifications, alter content, or predict hiring outcomes. The plain-text view is generated from the CV data, not extracted from a submitted PDF. The checklist reflects local formatting checks rather than an employer score. Its formatting choices follow Greenhouse's published parsing guidance: https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse .

Run `node verify-ats.cjs` for ATS mode, hidden entries, keyword boundaries, restoration, persistence, responsive layout, plain-text download, and one/two-page PDF fixtures. The hosting ZIP under `hosting/folio-cv-site.zip` includes the ATS feature; upload it again to deploy these changes.


## Expanded template collection

The catalog includes 100 additional choices across 20 named families and five editions (Midnight, Ocean, Forest, Clay, and Plum). These are curated variants built on the existing layout system. Chronicle, Mariner, Apprentice, and Byline add specific section, rail, header, and typography treatments. Existing template IDs remain unchanged. All 140 options have real rendered thumbnails and work with the same CV data, page controls, and ATS mode.

Homepage search combines with category filters and shows the matching count. Builder and modal thumbnails use lazy loading. `node verify-collection.cjs` checks catalog IDs/names, image assets, combined search/filter behavior, selection, persistence, ATS mode, and representative PDFs. `node capture-templates.cjs --missing` generates only missing previews; omit the option to refresh the complete catalog. `python package-hosting.py` refreshes the deployment folder and ZIP after future edits.
