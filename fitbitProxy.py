import http.server
import ssl
import urllib.parse
import requests

class FitbitProxyHandler(http.server.BaseHTTPRequestHandler):
    def _set_cors_headers(self, requested_headers=None):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        if requested_headers:
            self.send_header("Access-Control-Allow-Headers", requested_headers)
        else:
            self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Max-Age", "86400")  # cache for 1 day

    def end_headers(self):
        # Inject CORS headers for all responses
        super().end_headers()

    def do_OPTIONS(self):
        print(f">> [OPTIONS] {self.path}")
        requested_headers = self.headers.get("Access-Control-Request-Headers", "")
        print(">> Requested Headers:", requested_headers)

        self.send_response(204)
        self._set_cors_headers(requested_headers)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        print(f">> [GET] {self.path}")
        parsed_url = urllib.parse.urlparse(self.path)

        if not parsed_url.path.startswith("/fitbit"):
            self.send_response(404)
            self._set_cors_headers()
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"Only /fitbit proxy is supported.")
            return

        query = urllib.parse.parse_qs(parsed_url.query)
        path = query.get('path', [None])[0]
        if not path:
            self.send_response(400)
            self._set_cors_headers()
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"Missing 'path' query parameter.")
            return

        auth_header = self.headers.get('Authorization')
        if not auth_header:
            self.send_response(401)
            self._set_cors_headers()
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"Missing Authorization header.")
            return

        fitbit_url = f"https://api.fitbit.com/1/user/-/{path}"
        print(f">> Forwarding to: {fitbit_url}")
        # Build headers to forward
        forward_headers = {
            "Authorization": auth_header
        }
        if self.headers.get("Accept-Language"):
            forward_headers["Accept-Language"] = self.headers["Accept-Language"]
        if self.headers.get("Accept-Locale"):
            forward_headers["Accept-Locale"] = self.headers["Accept-Locale"]

        try:
            response = requests.get(fitbit_url, headers=forward_headers)
            print(f">> Fitbit responded with {response.status_code}")
            self.send_response(response.status_code)
            self._set_cors_headers()
            self.send_header("Content-Type", response.headers.get("Content-Type", "application/json"))
            self.end_headers()
            self.wfile.write(response.content)
        except Exception as e:
            print(f">> Proxy error: {e}")
            self.send_response(500)
            self._set_cors_headers()
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(f"Proxy error: {str(e)}".encode())


def run_proxy_server():
    httpd = http.server.HTTPServer(('127.0.0.1', 3000), FitbitProxyHandler)
    httpd.socket = ssl.wrap_socket(
        httpd.socket,
        certfile='./localhost.pem',
        keyfile='./localhost-key.pem',
        server_side=True
    )
    print("Serving Fitbit proxy on https://localhost:3000/fitbit?path=...")
    httpd.serve_forever()

if __name__ == "__main__":
    run_proxy_server()
