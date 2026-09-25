"""
run.py — One-Click Direct Launcher for BidSentinel

Starts both the FastAPI Backend and Next.js Frontend simultaneously,
performs prerequisite health checks, seeds the database if necessary,
and automatically opens the BidSentinel portal in your browser.

Usage:
    python run.py
    python run.py --no-browser
    python run.py --port-backend 8000 --port-frontend 3000
"""

import sys
import os
import time
import socket
import shutil
import signal
import argparse
import webbrowser
import subprocess
from pathlib import Path
from typing import List, Optional

# Root directory of BidSentinel
ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"
DATA_DIR = ROOT_DIR / "data"
SCRIPTS_DIR = ROOT_DIR / "scripts"
DB_PATH = BACKEND_DIR / "bidsentinel.db"

# ANSI Colors for clean terminal display
class Colors:
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"

# Disable colors on Windows cmd if ANSI not supported
if os.name == "nt":
    os.system("")

def print_banner():
    print(f"""
{Colors.CYAN}{Colors.BOLD}╔══════════════════════════════════════════════════════════════════════════╗
║               🛡️  B I D S E N T I N E L   P L A T F O R M               ║
║       AI-Powered Integrated Bid Compliance Verification for GeM          ║
║                       Smart India Hackathon 2026                         ║
╚══════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Checks whether a TCP port is currently open / in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0

def find_python_executable() -> str:
    """Locates the preferred Python interpreter (virtual environment first)."""
    # Check backend/.venv
    if os.name == "nt":
        venv_py = BACKEND_DIR / ".venv" / "Scripts" / "python.exe"
    else:
        venv_py = BACKEND_DIR / ".venv" / "bin" / "python"
    
    if venv_py.exists():
        return str(venv_py)
    
    # Check root .venv
    if os.name == "nt":
        root_venv_py = ROOT_DIR / ".venv" / "Scripts" / "python.exe"
    else:
        root_venv_py = ROOT_DIR / ".venv" / "bin" / "python"
        
    if root_venv_py.exists():
        return str(root_venv_py)
    
    # Fallback to active interpreter
    return sys.executable

def find_npm_executable() -> Optional[str]:
    """Locates npm on the system PATH."""
    npm_path = shutil.which("npm.cmd" if os.name == "nt" else "npm")
    if not npm_path:
        npm_path = shutil.which("npm")
    return npm_path

def ensure_database_and_data(py_exe: str):
    """Ensures datasets and SQLite database are ready before starting servers."""
    print(f"{Colors.DIM}[1/4] Checking datasets and database state...{Colors.RESET}")
    
    # Check if data directory or key JSONs are missing
    bidders_json = DATA_DIR / "bidders.json"
    tenders_json = DATA_DIR / "tenders.json"
    
    if not bidders_json.exists() or not tenders_json.exists():
        print(f"  {Colors.YELLOW}⚡ Generating synchronized dataset JSONs...{Colors.RESET}")
        gen_script = SCRIPTS_DIR / "generate_mock_data.py"
        subprocess.run([py_exe, str(gen_script)], cwd=str(ROOT_DIR), check=True)
    
    # Check if database exists or needs seeding
    if not DB_PATH.exists() or DB_PATH.stat().st_size == 0:
        print(f"  {Colors.YELLOW}⚡ Initializing & seeding SQLite database (10 Tenders, 50 Bidders)...{Colors.RESET}")
        seed_script = SCRIPTS_DIR / "seed_database.py"
        subprocess.run([py_exe, str(seed_script)], cwd=str(ROOT_DIR), check=True)
    
    print(f"  {Colors.GREEN}✓ Ground-truth datasets & SQLite database ready.{Colors.RESET}")

def wait_for_service(url_host: str, port: int, timeout_sec: int = 25) -> bool:
    """Waits until a network service is accepting connections."""
    start_time = time.time()
    while time.time() - start_time < timeout_sec:
        if is_port_in_use(port, url_host):
            return True
        time.sleep(0.5)
    return False

def terminate_process(proc: subprocess.Popen):
    """Safely terminates a process and its child processes."""
    if proc.poll() is not None:
        return
    
    try:
        if os.name == "nt":
            # Force kill entire process tree on Windows
            subprocess.run(
                ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        else:
            proc.terminate()
            try:
                proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                proc.kill()
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass

def main():
    parser = argparse.ArgumentParser(description="One-click launcher for BidSentinel")
    parser.add_argument("--no-browser", action="store_true", help="Do not automatically open the web browser")
    parser.add_argument("--port-backend", type=int, default=8000, help="Backend port (default: 8000)")
    parser.add_argument("--port-frontend", type=int, default=3000, help="Frontend port (default: 3000)")
    args = parser.parse_args()

    print_banner()

    # Step 1: Detect Python & Node
    py_exe = find_python_executable()
    npm_exe = find_npm_executable()

    if not npm_exe:
        print(f"{Colors.RED}❌ Error: Node.js / npm was not found on your PATH.{Colors.RESET}")
        print("Please install Node.js (https://nodejs.org) to run the BidSentinel frontend.")
        sys.exit(1)

    print(f"{Colors.DIM}• Python Interpreter: {py_exe}{Colors.RESET}")
    print(f"{Colors.DIM}• Node Package Manager: {npm_exe}{Colors.RESET}")

    # Step 2: Ensure database and mock datasets
    ensure_database_and_data(py_exe)

    # Step 3: Check frontend dependencies
    print(f"{Colors.DIM}[2/4] Verifying frontend environment...{Colors.RESET}")
    if not (FRONTEND_DIR / "node_modules").exists():
        print(f"  {Colors.YELLOW}⚡ Installing frontend dependencies (npm install)...{Colors.RESET}")
        subprocess.run([npm_exe, "install"], cwd=str(FRONTEND_DIR), check=True)
    print(f"  {Colors.GREEN}✓ Frontend packages verified.{Colors.RESET}")

    # Check port conflicts
    if is_port_in_use(args.port_backend):
        print(f"{Colors.YELLOW}⚠️  Warning: Port {args.port_backend} is already in use.{Colors.RESET}")
    if is_port_in_use(args.port_frontend):
        print(f"{Colors.YELLOW}⚠️  Warning: Port {args.port_frontend} is already in use.{Colors.RESET}")

    processes: List[subprocess.Popen] = []

    def signal_handler(sig, frame):
        print(f"\n{Colors.YELLOW}Shutting down BidSentinel services...{Colors.RESET}")
        for p in processes:
            terminate_process(p)
        print(f"{Colors.GREEN}✓ All services stopped. Goodbye!{Colors.RESET}")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, signal_handler)

    # Step 4: Launch Backend
    print(f"{Colors.DIM}[3/4] Launching FastAPI Backend on port {args.port_backend}...{Colors.RESET}")
    backend_cmd = [
        py_exe, "-m", "uvicorn", "app.main:app",
        "--host", "127.0.0.1",
        "--port", str(args.port_backend),
        "--reload"
    ]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=str(BACKEND_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.STDOUT
    )
    processes.append(backend_proc)

    # Wait for backend
    if wait_for_service("127.0.0.1", args.port_backend, timeout_sec=15):
        print(f"  {Colors.GREEN}✓ Backend online:{Colors.RESET} http://127.0.0.1:{args.port_backend}")
        print(f"  {Colors.DIM}  API Documentation (Swagger UI): http://127.0.0.1:{args.port_backend}/docs{Colors.RESET}")
    else:
        print(f"  {Colors.RED}❌ Backend did not respond in time.{Colors.RESET}")

    # Step 5: Launch Frontend
    print(f"{Colors.DIM}[4/4] Launching Next.js Frontend on port {args.port_frontend}...{Colors.RESET}")
    frontend_cmd = [npm_exe, "run", "dev"]
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=str(FRONTEND_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.STDOUT
    )
    processes.append(frontend_proc)

    # Wait for frontend
    if wait_for_service("localhost", args.port_frontend, timeout_sec=20):
        print(f"  {Colors.GREEN}✓ Frontend online:{Colors.RESET} http://localhost:{args.port_frontend}")
    else:
        print(f"  {Colors.YELLOW}⚡ Frontend starting on http://localhost:{args.port_frontend}...{Colors.RESET}")

    # Ready Banner
    app_url = f"http://localhost:{args.port_frontend}"
    print(f"""
{Colors.GREEN}{Colors.BOLD}🚀 BidSentinel is ready and running!{Colors.RESET}
────────────────────────────────────────────────────────────────────────
🌐 {Colors.BOLD}Web Application:{Colors.RESET}       {Colors.CYAN}{app_url}{Colors.RESET}
📚 {Colors.BOLD}Interactive API Docs:{Colors.RESET}  {Colors.CYAN}http://127.0.0.1:{args.port_backend}/docs{Colors.RESET}

🔑 {Colors.BOLD}Demo Officer Credentials:{Colors.RESET}
   Email:    {Colors.YELLOW}officer@gem-demo.gov.in{Colors.RESET}
   Password: {Colors.YELLOW}demo123{Colors.RESET}
   *(Or click "Auto-Fill Demo Credentials" on the login screen)*

📊 {Colors.BOLD}Active SIH 2026 Datasets:{Colors.RESET}
   • 10 Central Government & CPSE Tenders (TND001 – TND010)
   • 50 Bidders (BID001 – BID050) across MSME, DPIIT Startups, and Non-MSEs
   • 10 Statutory Live Connectors (GSTN, Udyam, ITD/PAN, MCA21, EPFO, etc.)
────────────────────────────────────────────────────────────────────────
{Colors.DIM}Press Ctrl+C at any time to gracefully terminate both services.{Colors.RESET}
""")

    # Open browser automatically unless requested not to
    if not args.no_browser:
        time.sleep(1.0)
        try:
            webbrowser.open(app_url)
        except Exception:
            pass

    # Keep alive and monitor child processes
    try:
        while True:
            time.sleep(1)
            # Check if any process terminated unexpectedly
            if backend_proc.poll() is not None:
                print(f"\n{Colors.RED}❌ Backend process exited unexpectedly (code {backend_proc.poll()}).{Colors.RESET}")
                break
            if frontend_proc.poll() is not None:
                print(f"\n{Colors.RED}❌ Frontend process exited unexpectedly (code {frontend_proc.poll()}).{Colors.RESET}")
                break
    except KeyboardInterrupt:
        signal_handler(None, None)
    finally:
        for p in processes:
            terminate_process(p)

if __name__ == "__main__":
    main()
