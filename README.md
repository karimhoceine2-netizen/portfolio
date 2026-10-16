# Karim — web & automation portfolio

A responsive one-page portfolio for a first-year AI student at Vrije Universiteit Amsterdam. It presents Dossier Compleet and LeadFlow as honest case studies: **Problem, Solution, Tech, Result, Link**.

Built together with an AI coding assistant. No framework, package installation, analytics, cookies, contact form or external font service is required. All screenshots use synthetic data. The GitHub links use the planned repository names; create and publish those repositories yourself before sharing the page.

## Preview

```bash
python3 -m http.server 8097 --bind 127.0.0.1 --directory dist
```

Open <http://127.0.0.1:8097>. You can also open `dist/index.html` directly in a browser. The preview command and responsive layout were checked during preparation.

## Deploy on Vercel

Publish the source yourself after completing the checklist. Choose **Other** as the framework preset, no build command, and **dist** as the output directory. No deployment was performed in this chat. See [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build).

## Structure

- `dist/index.html`: content and semantic structure.
- `dist/style.css`: responsive styles, focus states and reduced-motion support.
- `dist/assets/`: local screenshots, local fonts and the font license notice.

## Lessons learned

Show working interfaces before listing tools. State what a demo actually proves, and make simulated behavior visible. Keep contact simple without collecting visitor data.

## What I would improve next

Check the project links after publication, add a deployed URL only after a verified deployment, and ask recruiters for feedback on whether the case studies make the engineering choices clear.

## License

[MIT](LICENSE). The included Atkinson fonts retain their SIL Open Font License notice in `dist/assets/atkinson-OFL.txt`.
