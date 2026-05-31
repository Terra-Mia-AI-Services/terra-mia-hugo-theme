# Terra Mia Hugo Theme (estratto)

Questa cartella è una **snapshot** del tema Hugo centrale.

## Struttura
- `layouts/`: template Hugo
- `i18n/`: stringhe per UI (nav, home, ecc.)

## Nota operativa
In produzione il tema viene scaricato in Cloudflare Pages durante la build (vedi `plans/specs/hugo-template.md`).
Se aggiungi nuove `page_id`/pagine nel tema, ricordati di allineare anche il form (PAGE_SLUG_MAP in `site-form/src/data/constants.js`).

## Regole di integrazione (workspace)
- **Tema centrale + siti thin**: i siti clienti contengono solo `content/`, `hugo.toml`, `static/` (il tema vive in un repo dedicato e viene scaricato in build).
- **Webhook form ufficiale**: `https://terramia-vps.duckdns.org/webhook/site-form` (il path `/webhook-waiting/site-form` è deprecato).
- **Workflow n8n importabili**: i file in `workflows/*.json` devono restare **JSON validi**. Nei campi `parameters.jsCode` usare newline escapate `\n` e backslash doppi `\\` (vedi `plans/ops/incidents-log.md` Incident #4).
