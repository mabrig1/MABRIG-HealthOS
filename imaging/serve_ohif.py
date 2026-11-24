"""Loopback-only static SPA server for the optional built OHIF demo."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT=Path(__file__).resolve().parents[1]/"vendor/OHIF/platform/app/dist"
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def do_GET(self):
        if urlsplit(self.path).path in ("/localbasic","/viewer/dicomlocal","/local","/viewer"):
            self.path="/index.html"
        super().do_GET()
    def end_headers(self):
        self.send_header("Cross-Origin-Opener-Policy","same-origin")
        self.send_header("Cross-Origin-Embedder-Policy","require-corp")
        self.send_header("X-Content-Type-Options","nosniff")
        super().end_headers()
if __name__=="__main__":
    if not (ROOT/"index.html").is_file():
        raise SystemExit("Build the optional OHIF viewer first; see imaging/OHIF.md")
    print("Local synthetic viewer: http://127.0.0.1:8789/localbasic")
    ThreadingHTTPServer(("127.0.0.1",8789),Handler).serve_forever()
