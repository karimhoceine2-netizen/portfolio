# Karim Hoceine — portfolio

My portfolio site: three projects with the numbers behind them. Rewind (a crash-safe runtime for AI agents), a Dutch RAG system with a full evaluation and an outreach workflow with human review, plus LeadFlow, Dossier Compleet, client work and a live chatbot.

Three project panels stack while you scroll; each one shows its numbers with the source file underneath.

Every number on the page comes from a linked repository:
- 73/74, 10/11 and 0.76 vs 0.73: [rag-nl-overheid](https://github.com/karimhoceine2-netizen/rag-nl-overheid) `evals/results/` (question set v2)
- 0 vs 41: [rewind](https://github.com/karimhoceine2-netizen/rewind) `docs/RESULTS.md`

No framework, no build step, no analytics, no cookies, no contact form. The LeadFlow and Dossier Compleet screenshots use demo data.

## Preview

```bash
python3 -m http.server 8097 --bind 127.0.0.1 --directory dist
```

Open <http://127.0.0.1:8097>, or open `dist/index.html` directly.

## Deploy on Vercel

Framework preset **Other**, no build command, output directory **dist** (already set in `vercel.json`, which also adds basic security headers).

## Structure

- `dist/index.html`: content and semantic structure
- `dist/styles.css`: layout, tokens, focus states, reduced-motion support
- `dist/script.js`: hero dot field (Canvas 2D), stacking panels, live panel demos, list previews, copy-email button
- `dist/assets/`: favicon, link-preview image, CV, fonts and two screenshots

Fonts: Instrument Sans and Geist Mono, self-hosted in `dist/assets/fonts/` (SIL Open Font License, see `LICENSE.txt` there). The site makes no third-party requests.

CV: `dist/assets/CV_Karim_Hoceine_EN.pdf` and `CV_Karim_Hoceine_NL.pdf` (without phone number).

## License

[MIT](LICENSE).
