#!/usr/bin/env python3
"""
ClimateSphere System Status Checker
"""
import requests
import json
from datetime import datetime

def check_service(name, url, expected_status=200):
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == expected_status:
            print(f"✅ {name}: HEALTHY ({response.status_code})")
            return True, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
        else:
            print(f"⚠️  {name}: UNHEALTHY ({response.status_code})")
            return False, None
    except requests.exceptions.ConnectionError:
        print(f"❌ {name}: NOT RUNNING (Connection refused)")
        return False, None
    except requests.exceptions.Timeout:
        print(f"⏰ {name}: TIMEOUT")
        return False, None
    except Exception as e:
        print(f"❌ {name}: ERROR ({str(e)})")
        return False, None

def main():
    print("🌍 ClimateSphere System Status Check")
    print("=" * 50)
    print(f"⏰ Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    services = [
        ("Backend API", "http://localhost:3000/health"),
        ("ML API", "http://localhost:5000/health"),
        ("Frontend", "http://localhost:8000/index.html"),
    ]
    
    all_healthy = True
    
    for name, url in services:
        healthy, data = check_service(name, url)
        if not healthy:
            all_healthy = False
        
        # Show additional info for APIs
        if healthy and data and isinstance(data, dict):
            if 'models_loaded' in data:
                print(f"   📊 Models: {', '.join(data['models_loaded'])}")
            if 'status' in data:
                print(f"   📈 Status: {data['status']}")
    
    print()
    if all_healthy:
        print("🎉 ALL SERVICES HEALTHY!")
        print("🚀 ClimateSphere is ready at: http://localhost:8000")
    else:
        print("⚠️  Some services need attention")
        print("💡 Check the logs and restart failed services")
    
    print()
    print("🔗 Quick Links:")
    print("   🌐 Frontend: http://localhost:8000")
    print("   📊 Dashboard: http://localhost:8000/dashboard.html")
    print("   🔮 Predictions: http://localhost:8000/predictions.html")
    print("   📤 Upload: http://localhost:8000/upload.html")

if __name__ == "__main__":
    main()