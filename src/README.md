# Source Structure

This folder keeps the portfolio modular while staying compatible with GitHub Pages static hosting.

- `styles.css` contains shared visual styles.
- `scripts/main.js` loads HTML partials and initializes interactive behavior.
- `sections/` contains the page sections shown inside `<main>`.
- `components/` contains reusable page fragments that are not standalone sections.
- `header.html` and `footer.html` contain the site chrome.

When adding content, prefer creating or updating the smallest relevant partial instead of expanding `index.html`.
