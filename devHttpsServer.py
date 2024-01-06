import http.server
import ssl
from http.server import CGIHTTPRequestHandler

httpd = http.server.HTTPServer(('127.0.0.1', 8000), CGIHTTPRequestHandler)

# Use the ssl module to enable HTTPS
httpd.socket = ssl.wrap_socket(httpd.socket, certfile='./localhost.pem', keyfile='./localhost-key.pem', server_side=True)

print("Serving on https://localhost:8000/")
httpd.serve_forever()
