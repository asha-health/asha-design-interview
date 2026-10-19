#!/usr/bin/env python3
"""Serve a built prototype on 127.0.0.1 and keep its picks in answers.json next to the page.

GET /api/answers returns answers.json ({"answers": {...}}). POST /api/save merges the page's {"answers": {question: pick}}
into it, so each question keeps its latest pick and comment; other keys the page sends (like "decisions") are kept too.
Usage: python3 serve.py [port] [folder]   (folder defaults to the current directory; it must hold index.html)
"""
import http.server, json, os, pathlib, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 18791
HERE = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else os.getcwd()).resolve()
ANSWERS = HERE / "answers.json"


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(HERE), **k)

    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, body, code=200):
        data = json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path.split("?")[0] == "/api/answers":
            return self.send_json(json.loads(ANSWERS.read_text()) if ANSWERS.exists() else {"answers": {}})
        return super().do_GET()

    def do_POST(self):
        if self.path.split("?")[0] != "/api/save":
            return self.send_error(404)
        n = int(self.headers.get("Content-Length") or 0)
        if n > 500_000:
            return self.send_error(413)
        try:
            body = json.loads(self.rfile.read(n) or b"{}")
        except ValueError:
            return self.send_json({"ok": False, "error": "not JSON"}, 400)
        saved = json.loads(ANSWERS.read_text()) if ANSWERS.exists() else {"answers": {}}
        saved.update({k: v for k, v in body.items() if k != "answers"})
        saved.setdefault("answers", {}).update(body.get("answers") or {})
        ANSWERS.write_text(json.dumps(saved, indent=2) + "\n")
        return self.send_json({"ok": True})


if __name__ == "__main__":
    assert (HERE / "index.html").exists(), f"no index.html in {HERE}; run build.py first"
    print(f"Serving {HERE} on http://127.0.0.1:{PORT}/  (picks save to {ANSWERS.name})")
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
