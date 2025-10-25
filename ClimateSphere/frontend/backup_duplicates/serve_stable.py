#!/usr/bin/env python3
"""
Stable HTTP server for ClimateSphere frontend with better error handling
"""
import http.server
import socketserver
import webbrowser
import os
import signal
import sys

PORT = 8000

class StableHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Reduce logging noise
        if not any(x in args[0] for x in ['favicon.ico', '.map']):
            super().log_message(format, *args)

def signal_handler(sig, frame):
    print(f"\n🛑 Shutting down ClimateSphere Frontend Server...")
    sys.exit(0)

if __name__ == "__main__":
    # Handle Ctrl+C gracefully
    signal.signal(signal.SIGINT, signal_handler)
    
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    try:
        with socketserver.TCPServer(("", PORT), StableHTTPRequestHandler) as httpd:
            print(f"🌍 ClimateSphere Frontend Server")
            print(f"📡 Serving at http://localhost:{PORT}")
            print(f"🚀 Server running. Press Ctrl+C to stop.")
            print(f"📂 Serving from: {os.getcwd()}")
            print("-" * 50)
            
            # Don't auto-open browser to avoid issues
            # webbrowser.open(f'http://localhost:{PORT}')
            
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 10048:  # Port already in use
            print(f"❌ Port {PORT} is already in use!")
            print(f"💡 Try closing other servers or use a different port")
        else:
            print(f"❌ Server error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    finally:
        print(f"🛑 Server stopped.")