#!/usr/bin/env python3
"""Gate dependent service startup on the actual loopback listener."""
import socket
import sys
import time

port = int(sys.argv[1])
for _ in range(180):
    try:
        with socket.create_connection(('127.0.0.1', port), timeout=0.2):
            raise SystemExit(0)
    except OSError:
        time.sleep(0.5)
raise SystemExit(f'Service did not listen on {port} within 90 seconds')
