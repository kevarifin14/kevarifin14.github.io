"""Render a preview from exact thumbs-up revisions in a private Review deck."""

import argparse
from contextlib import suppress
from datetime import date
from html import escape
import json
import os
from pathlib import Path
import re
from shutil import copyfile, rmtree
import subprocess
from tempfile import mkdtemp
from urllib.parse import urlsplit

from serve import embed


HERE = Path(__file__).parent
APPROVAL = (
    "Put this exact title, text, dates and links on the private Concept Garden preview? "
    "Thumbs up approves that preview. Thumbs down keeps this draft private. "
    "Your vote is recorded for the site editor."
)
SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")


def approved_pages(pack, votes):
    encoded = json.loads(pack.read_text(encoding="utf-8"))
    if not re.fullmatch(r"concept-garden-preview-\d{8}", encoded["id"]):
        raise ValueError("Use a Concept Garden preview deck")
    result = subprocess.run(
        ["review", "feedback", str(votes), "--pack", str(pack)],
        check=True, capture_output=True, text=True,
    )
    approved = []
    for line in result.stdout.splitlines():
        vote = json.loads(line)
        if vote["decision"] != "up" or vote["prompt"] != APPROVAL:
            continue
        context = vote["evaluation"]
        slug = context["example"]
        item, = vote["items"]
        if (
            context["project"] != "concept-garden"
            or context["task"] != "preview-publishing"
            or context["criterion"] != "exact-copy-approval"
            or not SLUG.fullmatch(slug)
            or item["id"] != "page"
            or item["kind"] != "text"
        ):
            raise ValueError("Unexpected preview approval card")
        approved.append(parse_page(slug, vote["title"], item["text"]))
    if len({page["slug"] for page in approved}) != len(approved):
        raise ValueError("Multiple approved revisions for one preview page")
    return approved


def parse_page(slug, title, copy):
    summary, *sections = copy.split("\n\n")
    groups = {}
    for section in sections:
        heading, *rows = section.splitlines()
        if heading not in ("How it changed", "Reading", "In the news") or heading in groups or not rows:
            raise ValueError(f"Invalid review copy section for {slug}")
        groups[heading] = [row.split(" | ") for row in rows]
    trail = [(date.fromisoformat(day), text) for day, text in groups["How it changed"]]
    if not summary.strip() or trail != sorted(trail) or not all(text for _, text in trail):
        raise ValueError(f"Invalid dated trail for {slug}")
    reading = [(label, public_url(url)) for label, url in groups.get("Reading", [])]
    news = [(date.fromisoformat(day), label, public_url(url), text)
            for day, label, url, text in groups.get("In the news", [])]
    if any(day <= trail[0][0] for day, _, _, _ in news):
        raise ValueError(f"The news must follow the earliest dated thought for {slug}")
    return dict(slug=slug, title=title, summary=summary, trail=trail, reading=reading, news=news)


def public_url(url):
    parts = urlsplit(url)
    if (parts.scheme != "https" or not parts.hostname or "." not in parts.hostname
            or parts.username or parts.password or parts.hostname.endswith((".local", ".ts.net"))):
        raise ValueError("Reading and news links need public HTTPS URLs")
    return url


def time_tag(day):
    return f'<time datetime="{day.isoformat()}">{day:%b} {day.day}, {day.year}</time>'


def site(title, content):
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>{escape(title)} · Kevin Arifin</title>
  <link rel="stylesheet" href="/garden.css">
  <script src="/ask.js" defer></script>
</head>
<body>
  <header class="site-header">
    <a href="/">Kevin Arifin</a>
    <span>Private preview</span>
  </header>
  <main>{content}</main>
</body>
</html>
"""


def garden(pages):
    recent = sorted(pages, key=lambda page: page["trail"][-1][0], reverse=True)
    timely = [page for page in recent if page["news"]]
    lead = timely[-1] if timely else recent[0] if recent else None
    feature = ""
    if lead:
        if lead["news"]:
            day, label, _, _ = lead["news"][-1]
            caption = f"{escape(label)} · {time_tag(day)}"
        else:
            caption = "An idea from the garden"
        feature = f'''
<section class="feature" aria-label="Featured idea">
  <p class="note">{caption}</p>
  <h2><a href="/{lead["slug"]}/">{escape(lead["title"])}</a></h2>
  <p>{escape(lead["summary"])}</p>
  <a href="/{lead["slug"]}/">Follow the idea <span aria-hidden="true">↗</span></a>
</section>'''
    entries = []
    for page in recent:
        day = page["trail"][0][0]
        entries.append(f'''
<li><a href="/{page["slug"]}/">
  <span>{escape(page["title"])}</span>{time_tag(day)}<span class="arrow" aria-hidden="true">↗</span>
</a></li>''')
    if entries:
        library = f'<section class="index"><h2>All ideas</h2><ul>{"".join(entries)}</ul></section>'
        ask = """
<section class="ask" aria-labelledby="ask-title">
  <h2 id="ask-title">Ask the garden</h2>
  <form id="ask">
    <label class="visually-hidden" for="question">Your question</label>
    <input id="question" name="question" required maxlength="240" placeholder="What makes software hard to sell?">
    <button type="submit">Ask</button>
  </form>
  <p class="note">Finds passages from these ideas.</p>
  <p id="ask-status" role="status"></p>
  <ul id="ask-results"></ul>
</section>"""
    else:
        library = '<p class="empty">Ideas will appear here after Kevin approves them.</p>'
        ask = ""
    return site("Concept Garden", f"""
<section class="intro">
  <h1>Concept<br>Garden</h1>
  <p>Ideas I keep coming back to, and the things that changed my mind.</p>
</section>
{feature}
<div class="garden-grid">{library}{ask}</div>""")


def idea(page):
    trail = "".join(f'<li>{time_tag(day)}<p>{escape(text)}</p></li>' for day, text in page["trail"])
    links = "".join(f'<li><a href="{escape(url)}">{escape(label)}</a></li>' for label, url in page["reading"])
    reading = f'<section class="reading"><h2>Reading</h2><ul>{links}</ul></section>' if links else ""
    first = page["trail"][0][0]
    news = "".join(f'''
<aside class="news">
  <p class="note">In the news · {time_tag(day)}</p>
  <h2><a href="{escape(url)}">{escape(label)}</a></h2>
  <p>{escape(text)}</p>
  <p class="note">I was thinking about this on {time_tag(first)}.</p>
</aside>''' for day, label, url, text in page["news"])
    return site(page["title"], f"""
<article class="idea">
  <a class="back" href="/">← All ideas</a>
  <header>
    <p class="note">First thought · {time_tag(first)}</p>
    <h1>{escape(page["title"])}</h1>
    <p class="idea-summary">{escape(page["summary"])}</p>
  </header>
  {news}
  <section class="history"><h2>How it changed</h2><ol>{trail}</ol></section>
  {reading}
</article>""")


def publish(pages, deployment):
    """Swap the preview only after every page and search passage is ready."""
    passages = []
    embedding_inputs = []
    for page in pages:
        for text in [page["summary"], *(text for _, text in page["trail"])]:
            passages.append({"title": page["title"], "url": f'/{page["slug"]}/', "text": text})
            embedding_inputs.append(f'{page["title"]}. {text}')
    vectors = embed(embedding_inputs) if passages else []
    for passage, vector in zip(passages, vectors):
        passage["vector"] = vector
    deployment.mkdir(mode=0o700, parents=True, exist_ok=True)
    current = deployment / "current"
    previous = current.resolve() if current.is_symlink() else None
    release = Path(mkdtemp(prefix="release-", dir=deployment))
    pointer = release / "pointer"
    try:
        (release / "index.html").write_text(garden(pages), encoding="utf-8")
        for page in pages:
            directory = release / page["slug"]
            directory.mkdir()
            (directory / "index.html").write_text(idea(page), encoding="utf-8")
        (release / "passages.json").write_text(json.dumps(passages, ensure_ascii=False), encoding="utf-8")
        for asset in ("garden.css", "ask.js"):
            copyfile(HERE / asset, release / asset)
        pointer.symlink_to(release, target_is_directory=True)
        os.replace(pointer, current)
    except Exception:
        rmtree(release)
        raise
    if previous and previous.parent == deployment and previous.name.startswith("release-"):
        with suppress(FileNotFoundError):
            rmtree(previous)


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("deployment", type=Path, help="Preview output outside the Git checkout")
    mode = cli.add_mutually_exclusive_group(required=True)
    mode.add_argument("--pack", type=Path, help="Exact Review deck used on the phone")
    mode.add_argument("--empty", action="store_true", help="Render the empty preview shell")
    cli.add_argument("--votes", type=Path, default=Path.home() / "Library/Application Support/Review/Votes.json")
    args = cli.parse_args()
    deployment = args.deployment.resolve()
    if deployment.is_relative_to(HERE.parent.resolve()):
        cli.error("Use a preview output directory outside the checkout")
    pages = [] if args.empty else approved_pages(args.pack, args.votes)
    publish(pages, deployment)
    print(f"Preview ready with {len(pages)} approved ideas.")
