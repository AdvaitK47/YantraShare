#!/usr/bin/env python3
"""Run the YantraShare frontend and FastAPI backend together."""

import os
import socket
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND_HOST = "127.0.0.1"
BACKEND_PORT = 8001
FRONTEND_PORT = 5173


def is_port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(timeout)
        return sock.connect_ex((host, port)) == 0


def wait_for_port(host: str, port: int, timeout: int = 30) -> None:
    start = time.time()
    while time.time() - start < timeout:
        if is_port_open(host, port):
            return
        time.sleep(0.5)
    raise TimeoutError(f"Port {port} did not open on {host} within {timeout}s.")


def start_backend() -> subprocess.Popen:
    env = os.environ.copy()
    pythonpath = env.get("PYTHONPATH")
    env["PYTHONPATH"] = str(ROOT) + (os.pathsep + pythonpath if pythonpath else "")
    cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "Backend.workflow_api:app",
        "--host",
        BACKEND_HOST,
        "--port",
        str(BACKEND_PORT),
    ]
    proc = subprocess.Popen(cmd, cwd=str(ROOT), env=env)
    wait_for_port(BACKEND_HOST, BACKEND_PORT)
    return proc


def start_frontend() -> subprocess.Popen:
    cmd = [
        sys.executable,
        "-m",
        "http.server",
        str(FRONTEND_PORT),
        "--directory",
        str(ROOT / "frontend"),
    ]
    proc = subprocess.Popen(cmd, cwd=str(ROOT))
    wait_for_port(BACKEND_HOST, FRONTEND_PORT)
    return proc


def stop_process(proc: subprocess.Popen) -> None:
    if proc.poll() is None:
        proc.terminate()
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            proc.kill()


def main() -> None:
    print("Starting YantraShare stack...")
    backend = start_backend()
    print(f"Backend running at http://{BACKEND_HOST}:{BACKEND_PORT}")
    frontend = start_frontend()
    print(f"Frontend running at http://{BACKEND_HOST}:{FRONTEND_PORT}/index.html")
    print("Press Ctrl+C to stop both services.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping YantraShare stack...")
    finally:
        stop_process(frontend)
        stop_process(backend)


if __name__ == "__main__":
    main()
