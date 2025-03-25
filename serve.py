#!/usr/bin/env python3
from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys

class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        '': 'application/octet-stream',
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.json': 'application/json',
        '.wasm': 'application/wasm',
    }

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        SimpleHTTPRequestHandler.end_headers(self)

if __name__ == '__main__':
    port = 8000
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    
    server_address = ('', port)
    httpd = HTTPServer(server_address, CustomHTTPRequestHandler)
    print(f"Server running at http://localhost:{port}/")
    print("Press Ctrl+C to stop the server")
    httpd.serve_forever() 