# Hacker News Readability

A small, privacy-friendly userscript that keeps Hacker News looking like Hacker News while making discussion threads comfortable to read on wide screens.

## What it changes

- Limits comment text to a responsive **82-character measure** by default instead of stretching paragraphs across the display.
- Slightly increases comment type size and line spacing, while leaving Hacker News' typeface, orange header, and visual character intact.
- Adds quiet nesting guides without replacing Hacker News' built-in `[-]` branch-collapse control.
- Constrains the overall site on very wide displays and improves mobile overflow behavior.
- Adds an unobtrusive **readability** control to the header for comment width, type size, spacing, and Hacker News/dark/automatic themes.
- Stores preferences only in the browser. It makes no network requests and collects no data.

The script primarily enhances story discussion pages. Its restrained page-width treatment also applies to listings, profiles, submissions, and comment-history pages.

## Install

This project deliberately ships as one dependency-free file. A build system is not required: the file you review is the file your userscript manager runs.

1. Install a userscript manager. The primary tested target is AdGuard, with Tampermonkey and Violentmonkey intended to work as well.
2. Open [`hacker-news-readability.user.js`](./hacker-news-readability.user.js) as a raw file in your browser or copy its contents into a new userscript.
3. Visit [Hacker News](https://news.ycombinator.com/). Use the **readability** link in the orange header to adjust the defaults.

The script uses standard userscript metadata, requests no privileged APIs (`@grant none`), and matches only `news.ycombinator.com`.

## Design rationale

The default measure of 82 characters sits in the commonly recommended reading range without making technical comments feel artificially narrow. It is expressed in the CSS `ch` unit, so the line width responds to the selected text size. On smaller screens, the available viewport naturally becomes the limit.

The implementation intentionally builds on Hacker News' existing semantics and controls instead of reconstructing the comment tree. That makes it less fragile, preserves familiar behavior, and works even if JavaScript-only enhancements are unavailable. Settings use native form controls and visible keyboard focus.

### Recent-project review

Before implementation, current projects from 2023 onward were reviewed:

- [Hacker News Readability Tweaks](https://github.com/kazimieras-mi/Hacker-News-Readability-Tweaks) (updated 2025) demonstrates the value of better spacing and hierarchy, but makes broader visual changes than this project's HN-native goal.
- [hn-expand-comment](https://github.com/devriesd/hn-expand-comment) (2023) tackles deep mobile indentation. This project instead uses a small-screen CSS limit so comments retain context without requiring a separate expand interaction.

No source code was copied from either project. The standards references behind the approach include [WCAG text-spacing guidance](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html) and the [W3C Design System's line-length guidance](https://design-system.w3.org/styles/typography.html#line-length).

## Development

```sh
npm install
npm test
```

Tests load a representative Hacker News document in JSDOM and verify the userscript's behavior, settings, metadata, and privacy boundary.

## Compatibility

- Desktop Chromium, Firefox, and Safari through a standards-compliant userscript manager
- AdGuard's userscript support
- Mobile Chromium, Firefox, and Safari userscript environments

Desktop discussion pages are the initial focus. Mobile styles are deliberately conservative and can be refined after real-device testing.

## License

[MIT](./LICENSE)
