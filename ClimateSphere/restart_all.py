#!/usr/bin/env python3
"""
ClimateSphere - Restart All Services
"""
import subprocess
import time
import sys
import os

def run_command(command, cwd=None):
    """Run a command in the background"""
    try:
        if sys.platform == "win32":
            # Windows
            process = subprocess.Popen(
                f'start cmd /k "{command}"',
                shell=True,
                cwd=cwd
            )
        else:
            # Unix/Linux/Mac
            process = subprocess.Popen(
                command,
                shell=True,
                cwd=cwd
            )
        return process
    except Exception as e:
        print(f"❌ Error starting command: {e}")
        return None

def main():
    print("🌍 ClimateSphere - Restarting All Services")
    print("=" * 50)
    
    # Get the script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("🔄 Starting Backend API...")
    backend_dir = os.path.join(script_dir, "backend")
    run_command("npm run dev", backend_dir)
    time.sleep(2)
    
    print("🤖 Starting ML API...")
    ml_dir = os.path.join(script_dir, "backend", "ml")
    run_command("python prediction_api.py", ml_dir)
    time.sleep(2)
    
    print("🌐 Starting Frontend Server...")
    frontend_dir = os.path.join(script_dir, "frontend")
    run_command("python serve_stable.py", frontend_dir)
    time.sleep(2)
    
    print("\n✅ All services started!")
    print("🚀 ClimateSphere should be available at: http://localhost:8000")
    print("\n💡 Tip: Wait 10-15 seconds for all services to fully start")
    print("🔍 Run 'python check_status.py' to verify all services are healthy")

if __name__ == "__main__":
    main()