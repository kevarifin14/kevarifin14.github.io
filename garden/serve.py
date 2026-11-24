"""Serve only rendered preview pages and retrieve their approved passages."""

import argparse
import json
import math
from pathlib import Path
import re
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
from urllib.request import Request, urlopen


MODEL = "all-minilm"
INFERENCE = threading.Lock()
PAGE = re.compile(r"/(?:[a-z0-9]+(?:-[a-z0-9]+)*/)?")
ASSETS = {"/garden.css": "text/css", "/ask.js": "text/javascript"}


def embed(texts):
    """Encode text using the existing Ollama service on loopback."""
    request = Request(
        "http://127.0.0.1:11434/api/embed",
        data=json.dumps({"model": MODEL, "input": texts, "keep_alive": "2m"}).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urlopen(request, timeout=12) as response:
        vectors = json.load(response)["embeddings"]
    if len(vectors) != len(texts) or any(not vector for vector in vectors):
        raise ValueError("Ollama returned an incomplete embedding batch")
    return vectors


def similarity(left, right):
    if len(left) != len(right):
        raise ValueError("Passages and question used different embedding models")
    return sum(a * b for a, b in zip(left, right)) / (math.hypot(*left) * math.hypot(*right))


def find_passages(question, passages):
    if not passages:
        return []
    vector, = embed([question])
    ranked = sorted(
        ((similarity(vector, entry["vector"]), entry) for entry in passages),
        key=lambda result: result[0],
        reverse=True,
    )
    # Retrieve approved wording only, with at most one passage per page.
    found = {}
    floor = max(0.32, ranked[0][0] - 0.13)
    for score, entry in ranked:
        if score < floor or len(found) == 3:
            break
        found.setdefault(entry["url"], {key: entry[key] for key in ("title", "url", "text")})
    return list(found.values())


class Preview(BaseHTTPRequestHandler):
    timeout = 15

    def log_message(self, *_):
        # URLs and visitor questions do not belong in a retained access log.
        pass

    def respond(self, status, body, content_type):
        self.send_response(status)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Content-Length", len(body))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Robots-Tag", "noindex, nofollow")
        self.send_header("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none'; form-action 'self'")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path in ASSETS:
            relative, content_type = path[1:], ASSETS[path]
        elif PAGE.fullmatch(path):
            relative, content_type = path[1:] + "index.html", "text/html"
        else:
            self.respond(404, b"Page not found", "text/plain")
            return
        try:
            body = (self.server.current / relative).read_bytes()
        except (FileNotFoundError, NotADirectoryError):
            self.respond(404, b"Page not found", "text/plain")
            return
        self.respond(200, body, content_type)

    do_HEAD = do_GET

    def send_json(self, status, value):
        self.respond(status, json.dumps(value, ensure_ascii=False).encode(), "application/json")

    def do_POST(self):
        if self.path != "/ask":
            self.send_json(404, {"error": "Page not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if self.headers.get_content_type() != "application/json" or not 1 <= length <= 2048:
                raise ValueError
            question = json.loads(self.rfile.read(length))["question"]
            if not isinstance(question, str) or not 1 <= len(question.strip()) <= 240:
                raise ValueError
        except (KeyError, OSError, TypeError, ValueError):
            self.send_json(400, {"error": "Use a question of 1 to 240 characters."})
            return
        if not INFERENCE.acquire(blocking=False):
            self.send_json(503, {"error": "The garden is busy. Try again in a moment."})
            return
        try:
            passages = json.loads((self.server.current / "passages.json").read_text(encoding="utf-8"))
            found = find_passages(question.strip(), passages)
        except (KeyError, OSError, ValueError):
            self.send_json(503, {"error": "The garden couldn't answer right now. You can still browse the ideas."})
            return
        finally:
            INFERENCE.release()
        self.send_json(200, {"passages": found})


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("current", type=Path, help="Pointer to the current rendered preview")
    cli.add_argument("--port", type=int, default=47866)
    args = cli.parse_args()
    with ThreadingHTTPServer(("127.0.0.1", args.port), Preview) as server:
        server.current = args.current.absolute()
        server.serve_forever()
