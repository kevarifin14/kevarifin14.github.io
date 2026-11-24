# Concept Garden preview

Commonplace owns the ideas and recordings. Draft an edited concept and its dated
trail in Commonplace's context. Put only the proposed page copy in a private
Review card. The text item begins with the opening paragraph, followed by
plain-text sections separated by a blank line.

- `How it changed` takes `YYYY-MM-DD | edited thought` rows in date order.
- `Reading` takes `public source title | https://…` rows.
- `In the news` takes `YYYY-MM-DD | headline | https://… | relevance` rows. The
  news must follow the earliest thought.

Use the exact approval prompt and evaluation fields in `publish.py`. A thumbs
up covers that title, copy, date and source URL on the private preview only.
Review records votes. The publisher uses Review's revision-matched feedback to
render only the approvals. Keep decks, votes, the render directory and any
private evidence outside Git. Source dates and dates of the underlying thought
are separate.

```sh
preview_root="$HOME/Library/Application Support/Concept Garden/preview"
python3 garden/publish.py "$preview_root" --empty
python3 garden/serve.py "$preview_root/current"
```

After votes sync, run `python3 garden/publish.py "$preview_root" --pack PACK`
using the actual encoded deck. Omit `--votes` to read Review's synced votes.
The server reads the current release after each swap. A later change in the
exact reviewed text requires another vote. Rerender after a changed vote to
reconcile the preview.

The home and idea pages are static. The one preview server exposes those pages
and `POST /ask`. It uses the existing loopback Ollama service with
`ollama pull all-minilm` to find relevant verbatim passages from approved pages.
Question text stays in inference memory. Requests are serial through the
embedding model, and no model is needed to browse the pages. Generated answers
and synthetic narration would require their own implementation and review.
Use tailnet-only Tailscale Serve for the phone preview. Production Pages does
not run this server.
